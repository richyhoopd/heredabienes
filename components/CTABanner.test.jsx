import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CTABanner from "@/components/CTABanner";

describe("CTABanner", () => {
  it("renderiza el titular", () => {
    render(<CTABanner />);
    expect(
      screen.getByText("¿Tu propiedad tiene una historia sin resolver?")
    ).toBeInTheDocument();
  });

  it("enlaza a /contacto con next/link", () => {
    render(<CTABanner />);
    const cta = screen.getByRole("link", {
      name: /Agenda tu consulta gratis/i,
    });
    expect(cta).toHaveAttribute("href", "/contacto");
  });

  it("apunta al WhatsApp real de HEREDABIENES", () => {
    render(<CTABanner />);
    const wa = screen.getByRole("link", {
      name: /Escríbenos por WhatsApp/i,
    });
    expect(wa.getAttribute("href")).toContain("wa.me/5213313013253");
  });
});
