import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 96,
          border: "10px solid #0E0506",
        }}
      >
        <div
          style={{
            width: 320,
            height: 320,
            borderRadius: 999,
            border: "6px solid rgba(246,236,228,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontFamily:
                "ui-serif, Georgia, 'Times New Roman', serif",
              color: "#F6ECE4",
              lineHeight: 1,
              marginTop: 16,
            }}
          >
            T&amp;A
          </div>
        </div>
      </div>
    ),
    size,
  );
}

