export function validateSkill(text, name = 'superbrain') {
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (!new RegExp(`^---\\nname: ${name}\\ndescription: .+\\n---\\n`).test(normalized)) throw new Error('Invalid skill frontmatter');
  if (normalized.length >= 6500) throw new Error('Entrypoint too large; move conditional detail to references');
  return normalized;
}
