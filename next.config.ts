import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @sparticuz/chromium ships a ~55MB Chromium binary in
  // node_modules/@sparticuz/chromium/bin/. Two things have to happen
  // for the PDF v2 route to launch Chrome on Vercel:
  //   1. Don't let Next bundle the package — it must load as a native
  //      Node module so the binary path is preserved.
  //   2. Tell the output tracer to copy the binary into the function
  //      bundle, otherwise the executablePath resolves to a path that
  //      doesn't exist in the deployment and Chrome refuses to launch
  //      (api returns { error: "render_failed", ... }).
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/api/draft/[id]/pdf": ["./node_modules/@sparticuz/chromium/**"],
  },
};

export default nextConfig;
