const personalMarketplace='created-by-me-remote';
const repository='https://github.com/kryddlandet-maker/SuperBrain';
function ownedPrivate(plugin,marketplaceName){
  // Codex maps USER scope to this marketplace and intentionally omits
  // shareContext. The service also replaces developerName with the account name.
  if(marketplaceName===personalMarketplace){
    const frontend=plugin.name==='frontend-design';
    return plugin.source?.type==='remote'&&plugin.id===plugin.name+'@'+personalMarketplace&&plugin.shareContext==null&&plugin.interface?.displayName===(frontend?'Frontend Design':'SuperBrain')&&plugin.interface?.websiteUrl===(frontend?repository+'/tree/main/plugins/frontend-design':repository);
  }
  return plugin.interface?.developerName==='SuperBrain'&&plugin.shareContext?.discoverability==='PRIVATE'&&Array.isArray(plugin.shareContext.sharePrincipals)&&plugin.shareContext.sharePrincipals.length>0&&plugin.shareContext.sharePrincipals.every(p=>p.role==='owner');
}

async function listOwnedPlugins(client){
  const shared=await client.call('plugin/share/list',{});
  if(!Array.isArray(shared.data))throw new Error('Codex returned an unsupported plugin list; no plugins were changed');
  const personal=await client.call('plugin/list',{marketplaceKinds:[personalMarketplace],forceRefetch:true});
  if(!Array.isArray(personal.marketplaces)||!Array.isArray(personal.marketplaceLoadErrors)||personal.marketplaceLoadErrors.length)throw new Error('Codex could not load the complete personal plugin catalog; no plugins were changed');
  const entries=shared.data.map(({plugin})=>({plugin,marketplaceName:'workspace-shared-with-me'}));
  for(const marketplace of personal.marketplaces){
    if(marketplace.name!==personalMarketplace||!Array.isArray(marketplace.plugins))throw new Error('Codex returned an unsupported personal marketplace; no plugins were changed');
    for(const plugin of marketplace.plugins)if(!entries.some(e=>plugin.remotePluginId&&e.plugin.remotePluginId===plugin.remotePluginId))entries.push({plugin,marketplaceName:marketplace.name});
  }
  return entries;
}

async function readOwnedPlugin(client,receipt,marketplaceName){
  const {plugin}=await client.call('plugin/read',{pluginName:receipt.remotePluginId,remoteMarketplaceName:marketplaceName});
  if(plugin?.summary?.name!==receipt.name||plugin.summary.remotePluginId!==receipt.remotePluginId||!ownedPrivate(plugin.summary,plugin.marketplaceName))throw new Error('Private ownership is not confirmed for '+receipt.name);
  return plugin;
}

/** Create owner-private account plugins; never publish to a workspace or public directory. */
export async function registerCodexPlugins(client,bundle,{update=false,onReceipt=async()=>{}}={}){
  const existing=await listOwnedPlugins(client),receipts=[];
  for(const plugin of bundle.plugins){
    const matches=existing.filter(p=>p.plugin?.name===plugin.name);
    if(matches.length>1)throw new Error('Several owned plugins are named '+plugin.name+'. Resolve the duplicate in Codex before retrying.');
    if(matches.length&&(!matches[0].plugin.remotePluginId||!ownedPrivate(matches[0].plugin,matches[0].marketplaceName)))throw new Error('Existing plugin is not a confirmed owner-only SuperBrain package: '+plugin.name);
  }
  for(const plugin of bundle.plugins){
    const entry=existing.find(p=>p.plugin.name===plugin.name),current=entry?.plugin;
    let remotePluginId=current?.remotePluginId||null,shareUrl=current?.shareContext?.shareUrl||null;
    if(!remotePluginId||update){
      const params=remotePluginId?{pluginPath:plugin.root,remotePluginId}:{pluginPath:plugin.root,discoverability:'PRIVATE',shareTargets:[]};
      const saved=await client.call('plugin/share/save',params);
      remotePluginId=saved.remotePluginId;shareUrl=saved.shareUrl;
      if(typeof remotePluginId!=='string'||!remotePluginId||current&&remotePluginId!==current.remotePluginId)throw new Error('Codex did not confirm the saved plugin ID');
    }
    const receipt={name:plugin.name,remotePluginId,shareUrl,requestedVisibility:'PRIVATE',saved:true,installationRequested:false,verified:false};receipts.push(receipt);await onReceipt(receipts);
    const detail=await readOwnedPlugin(client,receipt,entry?.marketplaceName||personalMarketplace);
    receipt.marketplaceName=detail.marketplaceName;
    receipt.privacyEvidence=detail.marketplaceName===personalMarketplace?'USER scope':'private owner-only share';
    receipt.shareUrl=detail.shareUrl||receipt.shareUrl;
    await client.call('plugin/install',{pluginName:remotePluginId,remoteMarketplaceName:receipt.marketplaceName});
    receipt.installationRequested=true;await onReceipt(receipts);
  }
  // This inventory feeds mention surfaces, unlike plugin/share/list which only
  // lists workspace shares and can be empty for installed personal plugins.
  const verified=await client.call('plugin/installed',{});
  if(!Array.isArray(verified.marketplaces)||!Array.isArray(verified.marketplaceLoadErrors)||verified.marketplaceLoadErrors.length)throw new Error('Codex could not confirm the complete installed plugin inventory');
  for(const receipt of receipts){
    const marketplace=verified.marketplaces.find(m=>m.name===receipt.marketplaceName);
    const current=marketplace?.plugins?.find(p=>p?.remotePluginId===receipt.remotePluginId);
    if(!current?.installed||!current.enabled||!ownedPrivate(current,receipt.marketplaceName))throw new Error('Installation/private access is not confirmed for '+receipt.name);
    const detail=await readOwnedPlugin(client,receipt,receipt.marketplaceName);
    if(!detail.skills?.some(s=>s.name===receipt.name&&s.enabled))throw new Error('Enabled plugin skill is not confirmed for '+receipt.name);
    receipt.visibility='PRIVATE';receipt.installed=true;
    receipt.verified=true;
  }
  await onReceipt(receipts);return receipts;
}
