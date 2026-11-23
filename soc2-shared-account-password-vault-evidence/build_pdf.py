import sys
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

TITLE = "AWS production root account"
FOOTER = "SOC 2 | Shared account password management | Evidence screenshot {:02d}"
PAGES = [
    (
        "01-1password-aws-gateway-root-shared-prod-access.png",
        "Password stored in 1Password",
        "The shared AWS root login is stored in the Shared-Prod vault. "
        "Access is limited to the Production group, the Planera Inc admin account and Tucker DeWitt.",
    ),
    (
        "02-1password-planera-inc-admin-account-groups.png",
        "Planera Inc admin account",
        "Planera Inc (1passbot@planera.io) is the 1Password admin account, provisioned through the identity provider.",
    ),
    (
        "03-1password-production-group-members.png",
        "Production group members",
        "The Production group grants access to the Shared-Prod vault. It has six members.",
    ),
]

NAVY = HexColor("#13203a")
SUBTITLE = HexColor("#2c4a6e")
BODY = HexColor("#333a44")
MUTED = HexColor("#6b7280")
RULE = HexColor("#cbd5e1")
MARGIN = 30


def main(src: Path, out: Path) -> None:
    w, h = landscape(A4)
    c = canvas.Canvas(str(out), pagesize=(w, h))
    for i, (img, subtitle, body) in enumerate(PAGES, 1):
        c.setFillColor(NAVY)
        c.rect(0, h - 10, w, 10, stroke=0, fill=1)
        c.setFont("Helvetica", 18)
        c.drawString(MARGIN, h - 40, TITLE)
        c.setFillColor(SUBTITLE)
        c.setFont("Helvetica", 11)
        c.drawString(MARGIN, h - 58, subtitle)
        c.setFillColor(BODY)
        c.setFont("Helvetica", 10)
        c.drawString(MARGIN, h - 75, body)

        reader = ImageReader(str(src / img))
        iw, ih = reader.getSize()
        box_w, box_h = w - 2 * MARGIN - 50, h - 95 - 40
        scale = min(box_w / iw, box_h / ih)
        dw, dh = iw * scale, ih * scale
        c.drawImage(reader, (w - dw) / 2, h - 95 - dh, dw, dh)

        c.setStrokeColor(RULE)
        c.setLineWidth(0.5)
        c.line(MARGIN, 27, w - MARGIN, 27)
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 8)
        c.drawString(MARGIN, 13, FOOTER.format(i))
        c.drawRightString(w - MARGIN, 13, f"{i} / {len(PAGES)}")
        c.showPage()
    c.save()


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
