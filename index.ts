import { resolveSettings } from "./src/config.ts"
import { afterTool } from "./src/diagnostics.ts"
import { LspManager } from "./src/manager.ts"
import { lspTool } from "./src/tool.ts"

export default {
  id: "opencode-v2-lsp-support",
  async setup(ctx: any) {
    const root: string = ctx.location.directory
    const settings = resolveSettings(root, ctx.options ?? {})
    if (settings.debug) console.error(`[lsp] servers: ${settings.servers.map((server) => server.id).join(", ") || "none"}`)
    if (settings.servers.length === 0) return

    const manager = new LspManager(settings, root)
    const tools = await ctx.tool.transform((editor: any) => editor.add(lspTool(manager, root)))
    const hook = await ctx.tool.hook("execute.after", afterTool(manager, root, settings.diagnostics, ctx.session))
    return async () => {
      await hook.dispose()
      await tools.dispose()
      await manager.shutdown()
    }
  },
}
