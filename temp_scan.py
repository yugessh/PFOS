import re
import pathlib
root = pathlib.Path(r'e:/project/PFOS')
files = {}
for p in root.rglob('*'):
    if p.suffix in ('.ts', '.tsx'):
        try:
            content = p.read_text(encoding='utf-8')
        except Exception:
            continue
        exports = {
            'default': bool(re.search(r'export\s+default\s+', content)),
            'named': bool(re.search(r'export\s+(function|const|class|interface|type|enum|\{)', content)),
        }
        imports = re.findall(r'import\s+([^;]+?)\s+from\s+["\']([^"\']+)["\']', content)
        files[str(p)] = {'exports': exports, 'imports': imports, 'content': content}

problems = []
for path, data in files.items():
    for imp, mod in data['imports']:
        if mod.startswith('.') or mod.startswith('@/components') or mod.startswith('@/src/components') or '/components/' in mod:
            target = None
            if mod.startswith('@/components/'):
                target = root / mod[len('@/components/'):]
            elif mod.startswith('@/src/components/'):
                target = root / mod[len('@/src/components/'):]
            elif mod.startswith('.'):
                target = (pathlib.Path(path).parent / mod).resolve()
            if target:
                if target.is_file():
                    t = str(target)
                    target_exports = files.get(t, {}).get('exports')
                    if target_exports:
                        default_import = not imp.strip().startswith('{') and not imp.strip().startswith('*')
                        if default_import and not target_exports['default']:
                            problems.append((path, imp, mod, t, 'default import from no default export'))
                        if imp.strip().startswith('{') and target_exports['default'] and not target_exports['named']:
                            problems.append((path, imp, mod, t, 'named import from default-only export'))
                else:
                    # try .tsx or .ts extension variants
                    for ext in ['.tsx', '.ts']:
                        candidate = target.with_suffix(ext)
                        if candidate.exists():
                            t = str(candidate)
                            target_exports = files.get(t, {}).get('exports')
                            if target_exports:
                                default_import = not imp.strip().startswith('{') and not imp.strip().startswith('*')
                                if default_import and not target_exports['default']:
                                    problems.append((path, imp, mod + ext, t, 'default import from no default export'))
                                if imp.strip().startswith('{') and target_exports['default'] and not target_exports['named']:
                                    problems.append((path, imp, mod + ext, t, 'named import from default-only export'))
                            break
print('issues', len(problems))
for item in problems:
    print(item)
