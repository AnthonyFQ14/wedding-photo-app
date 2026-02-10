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
          background: "#FDFCF8",
          borderRadius: 96,
          border: "10px solid #D6C3A5",
        }}
      >
        <div
          style={{
            width: 320,
            height: 320,
            borderRadius: 999,
            border: "6px solid rgba(45,36,30,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 210,
              fontFamily:
                "ui-serif, Georgia, 'Times New Roman', serif",
              color: "#2D241E",
              lineHeight: 1,
              marginTop: 16,
            }}
          >
            W
          </div>
        </div>
      </div>
    ),
    size,
  );
}

