import { ImageResponse } from "next/og";
import { join } from "path";
import { readFile } from "fs/promises";

// Using a chunky font for impact
const fontUrl =
  "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-900-normal.woff";

export async function GET() {
  try {
    const [fontData, imageBuffer] = await Promise.all([
      fetch(fontUrl).then((res) => res.arrayBuffer()),
      readFile(join(process.cwd(), "public", "festive.png")),
    ]);

    const base64 = imageBuffer.toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundImage: `url(${dataUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Glass Card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "800px",
              height: "500px",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 40,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              border: "4px solid rgba(255, 255, 255, 0.5)",
              textAlign: "center",
              padding: "40px",
            }}
          >
            {/* Logo */}
            <div
              style={{
                fontSize: 28,
                color: "#888",
                marginBottom: 20,
                letterSpacing: "-0.05em",
              }}
            >
              gustoko.ng
            </div>

            {/* Option 1 */}
            <div
              style={{
                fontSize: 70,
                color: "#d32f2f", // Festive Red
                lineHeight: 1,
                marginBottom: 10,
              }}
            >
              Create a Wishlist
            </div>

            {/* The "OR" Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                margin: "15px 0",
              }}
            >
              <div style={{ height: 2, width: 60, background: "#ddd" }} />
              <div
                style={{
                  fontSize: 24,
                  color: "#999",
                  margin: "0 20px",
                  fontWeight: 400,
                  background: "#f0f0f0",
                  padding: "4px 12px",
                  borderRadius: 12,
                }}
              >
                OR
              </div>
              <div style={{ height: 2, width: 60, background: "#ddd" }} />
            </div>

            {/* Option 2 */}
            <div
              style={{
                fontSize: 70,
                color: "#2e7d32", // Forest Green
                lineHeight: 1,
                marginTop: 10,
              }}
            >
              Give Gifts
            </div>

            {/* Footer Icon */}
            <div style={{ fontSize: 50, marginTop: 30 }}>🎁</div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter",
            data: fontData,
            style: "normal",
            weight: 900,
          },
        ],
      }
    );
  } catch (e) {
    console.error("OG Image Error:", e);
    return new Response("Failed to generate image", { status: 500 });
  }
}
