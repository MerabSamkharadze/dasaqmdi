import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#160905",
          color: "#C7AE6A",
          fontSize: 64,
        }}
      >
        TEST
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
