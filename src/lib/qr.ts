import QRCode from "qrcode";

export async function qrSvg(text: string, opts: { dark?: string; light?: string } = {}) {
  return QRCode.toString(text, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: opts.dark ?? "#14202b", light: opts.light ?? "#ffffff" },
  });
}
