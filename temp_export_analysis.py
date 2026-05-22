import pathlib, re
root = pathlib.Path(r'e:/project/PFOS')
files = list(root.rglob('*.tsx')) + list(root.rglob('*.ts'))
export_files=[]
for p in files:
    if 'node_modules' in str(p):
        continue
    content = p.read_text(encoding='utf-8', errors='ignore')
    if re.search(r'export\s+default\s+function\s+([A-Za-z0-9_]+)', content):
        match = re.search(r'export\s+default\s+function\s+([A-Za-z0-9_]+)', content)
        export_files.append((str(p), 'default function', match.group(1)))
    elif re.search(r'export\s+default\s+class\s+([A-Za-z0-9_]+)', content):
        match = re.search(r'export\s+default\s+class\s+([A-Za-z0-9_]+)', content)
        export_files.append((str(p), 'default class', match.group(1)))
    elif re.search(r'export\s+default\s+const\s+([A-Za-z0-9_]+)', content):
        match = re.search(r'export\s+default\s+const\s+([A-Za-z0-9_]+)', content)
        export_files.append((str(p), 'default const', match.group(1)))
    elif re.search(r'export\s+default\s*\(', content):
        export_files.append((str(p), 'default anonymous', None))
    elif re.search(r'export\s+default\s+\{', content):
        export_files.append((str(p), 'default object', None))

print('default-exported files:')
for f in export_files:
    print(f)

print('\nImport usage for these files:')
for fpath, kind, name in export_files:
    rel = pathlib.Path(fpath).relative_to(root)
    basename = pathlib.Path(fpath).stem
    pattern = re.compile(r'import\s+([^;]+?)\s+from\s+["\"](?:.*?/)?' + re.escape(basename) + r'["\]')
    # simpler regex with basename if path ends with basename
    for q in files:
        if 'node_modules' in str(q): continue
        c = q.read_text(encoding='utf-8', errors='ignore')
        for m in re.finditer(r'import\s+([^;]+?)\s+from\s+["\']([^"\']+)\"?\'?', c):
            imp= m.group(1)
            mod= m.group(2)
            if mod.endswith('/' + basename) or mod == basename or mod.endswith(basename):
                if 'components' in mod or '/src/' in mod or mod.startswith('@/'):
                    print('from', q.relative_to(root), 'imports', imp.strip(), 'from', mod)
