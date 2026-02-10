import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FDFCF8",
          borderRadius: 44,
          border: "6px solid #D6C3A5",
        }}
      >
        <div
          style={{
            fontSize: 86,
            fontFamily: "ui-serif, Georgia, 'Times New Roman', serif",
            color: "#2D241E",
            lineHeight: 1,
            marginTop: 10,
          }}
        >
          W
        </div>
      </div>
    ),
    size,
  );
}

