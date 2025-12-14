import { ImageResponse } from "next/og";
import { join } from "path";
import { readFile } from "fs/promises";
import prisma from "@/lib/prisma";

// Using a chunky font for impact
const fontUrl =
  "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-900-normal.woff";

// 1. Update the type definition to wrap params in Promise
type Props = {
  params: Promise<{ shareId: string }>;
};

export async function GET(_: Request, props: Props) {
  // 2. Await the params
  const { shareId } = await props.params;

  if (!shareId) {
    return new Response("Share ID is required", { status: 400 });
  }

  // 1. Fetch Data
  const wishlist = await prisma.wishlist.findFirst({
    where: { shareId },
    include: { user: true },
  });

  if (!wishlist) {
    return new Response("Wishlist not found", { status: 404 });
  }

  try {
    // 2. Load Assets
    const [fontData, imageBuffer] = await Promise.all([
      fetch(fontUrl).then((res) => res.arrayBuffer()),
      readFile(join(process.cwd(), "public", "festive.png")),
    ]);

    const base64 = imageBuffer.toString("base64");
    const bgDataUrl = `data:image/png;base64,${base64}`;

    // Handle User Image (Fallback to UI Avatars if null)
    const userImage =
      wishlist.user.image ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        wishlist.user.name || "User"
      )}&background=random&size=256`;

    // Get first name for a more personal CTA
    const firstName = wishlist.user.name?.split(" ")[0] || "them";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundImage: `url(${bgDataUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Glass Card */}
          <div
            style={{
              display: "flex",
              // Changed to ROW to put image left, text right
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start", // Start aligning from left
              gap: "40px", // Space between image and text
              width: "1100px",
              height: "450px",
              backgroundColor: "rgba(255, 255, 255, 0.92)", // Slightly more opaque for text readability
              borderRadius: 48,
              boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.5)",
              border: "6px solid rgba(255, 255, 255, 0.6)",
              padding: "60px",
              position: "relative", // For absolute positioning the logo
            }}
          >
            {/* Logo Watermark (Top Right) */}
            <div
              style={{
                position: "absolute",
                top: 30,
                right: 40,
                fontSize: 24,
                color: "#999",
                letterSpacing: "-0.05em",
              }}
            >
              gustoko.ng
            </div>

            {/* LEFT: User Avatar */}
            <div
              style={{
                display: "flex",
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "8px solid #d32f2f", // Festive Red Border
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                flexShrink: 0, // Prevent squishing
              }}
            >
              {/* Using standard img tag for external images in OG */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userImage}
                alt="User"
                width="220"
                height="220"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            {/* RIGHT: Text Content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start", // Left align text
                justifyContent: "center",
                flexGrow: 1,
              }}
            >
              {/* Wishlist Name */}
              <div
                style={{
                  fontSize: 60, // Slightly smaller to fit CTA
                  color: "#1a1a1a",
                  lineHeight: 1.1,
                  fontWeight: 900,
                  marginBottom: 12,
                  // Handle long names
                  display: "-webkit-box",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  wordWrap: "break-word",
                  maxHeight: "180px", // Reduced height slightly
                }}
              >
                {wishlist.name}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#d32f2f", // Festive Red
                  color: "white",
                  padding: "12px 28px",
                  borderRadius: 99, // Pill shape looks like a button
                  fontSize: 28,
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(211, 47, 47, 0.3)",
                }}
              >
                <span style={{ marginRight: 12 }}>🎁</span>
                <span>Help make {firstName}&apos;s wishes come true!</span>
              </div>
            </div>
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
