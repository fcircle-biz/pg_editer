export const editor = {
  create: () => ({
    dispose: () => {},
    getModel: () => ({
      dispose: () => {},
    }),
    setValue: () => {},
    getValue: () => '',
    onDidChangeModelContent: () => ({ dispose: () => {} }),
    updateOptions: () => {},
    layout: () => {},
  }),
  createModel: () => ({}),
  setTheme: () => {},
  defineTheme: () => {},
}

export const languages = {
  typescript: {
    typescriptDefaults: {
      setCompilerOptions: () => {},
      setDiagnosticsOptions: () => {},
    },
  },
}

export default {
  editor,
  languages,
}