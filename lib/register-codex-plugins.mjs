function ownedPrivate(plugin){
  return plugin.interface?.developerName==='SuperBrain'&&plugin.shareContext?.discoverability==='PRIVATE'&&Array.isArray(plugin.shareContext.sharePrincipals)&&plugin.shareContext.sharePrincipals.length>0&&plugin.shareContext.sharePrincipals.every(p=>p.role==='owner');
}

/** Create owner-private account plugins; never publish to a workspace or public directory. */
export async function registerCodexPlugins(client,bundle,{update=false,onReceipt=async()=>{}}={}){
  const listed=await client.call('plugin/share/list',{});
  if(!Array.isArray(listed.data))throw new Error('Codex returned an unsupported plugin list; no plugins were changed');
  const existing=listed.data.map(p=>p.plugin),receipts=[];
  for(const plugin of bundle.plugins){
    const matches=existing.filter(p=>p?.name===plugin.name);
    if(matches.length>1)throw new Error('Several owned plugins are named '+plugin.name+'. Resolve the duplicate in Codex before retrying.');
    if(matches.length&&(!matches[0].remotePluginId||!ownedPrivate(matches[0])))throw new Error('Existing plugin is not a confirmed owner-only SuperBrain package: '+plugin.name);
  }
  for(const plugin of bundle.plugins){
    const current=existing.find(p=>p.name===plugin.name);
    let remotePluginId=current?.remotePluginId||null,shareUrl=current?.shareContext?.shareUrl||null;
    if(!remotePluginId||update){
      const params=remotePluginId?{pluginPath:plugin.root,remotePluginId}:{pluginPath:plugin.root,discoverability:'PRIVATE',shareTargets:[]};
      const saved=await client.call('plugin/share/save',params);
      remotePluginId=saved.remotePluginId;shareUrl=saved.shareUrl;
      if(typeof remotePluginId!=='string'||!remotePluginId)throw new Error('Codex did not confirm the saved plugin ID');
    }
    const receipt={name:plugin.name,remotePluginId,shareUrl,requestedVisibility:'PRIVATE',saved:true,installationRequested:false,verified:false};receipts.push(receipt);await onReceipt(receipts);
    await client.call('plugin/install',{pluginName:remotePluginId,remoteMarketplaceName:'workspace-shared-with-me'});
    receipt.installationRequested=true;await onReceipt(receipts);
  }
  const verified=await client.call('plugin/share/list',{});
  for(const receipt of receipts){
    const current=(verified.data||[]).map(p=>p.plugin).find(p=>p?.remotePluginId===receipt.remotePluginId);
    if(!current?.installed||!current.enabled||!ownedPrivate(current))throw new Error('Installation/private access is not confirmed for '+receipt.name);
    receipt.visibility='PRIVATE';receipt.installed=true;
    receipt.verified=true;
  }
  await onReceipt(receipts);return receipts;
}
