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
          background: "#420506",
          borderRadius: 44,
          border: "6px solid #0E0506",
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontFamily: "ui-serif, Georgia, 'Times New Roman', serif",
            color: "#F6ECE4",
            lineHeight: 1,
            marginTop: 10,
          }}
        >
          T&amp;A
        </div>
      </div>
    ),
    size,
  );
}

