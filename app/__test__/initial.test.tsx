import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DrawingCursor from "@/app/page";

// Mock do componente 3D
vi.mock("@/app/pages/animations/BallHome", () => ({
  default: () => <div data-testid="interactive-sphere" />,
}));

describe("DrawingCursor", () => {
  let contextMock: {
    clearRect: ReturnType<typeof vi.fn>;
    beginPath: ReturnType<typeof vi.fn>;
    moveTo: ReturnType<typeof vi.fn>;
    lineTo: ReturnType<typeof vi.fn>;
    stroke: ReturnType<typeof vi.fn>;
    arc: ReturnType<typeof vi.fn>;
    fill: ReturnType<typeof vi.fn>;

    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
    lineCap: CanvasLineCap;
    lineJoin: CanvasLineJoin;
  };

  beforeEach(() => {
    contextMock = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),

      // Propriedades do Canvas
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      lineCap: "round",
      lineJoin: "round",
    };

    vi.spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockImplementation(
        () =>
          contextMock as unknown as CanvasRenderingContext2D
      );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("renderização", () => {
    it("deve renderizar os controles da página", () => {
      render(<DrawingCursor />);

      expect(
        screen.getByRole("button", { name: /desenhar/i })
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: /parar/i })
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: /limpar/i })
      ).toBeInTheDocument();

      expect(
        screen.getByTestId("interactive-sphere")
      ).toBeInTheDocument();
    });

    it("deve renderizar o canvas", () => {
      render(<DrawingCursor />);

      const canvas = document.querySelector("canvas");

      expect(canvas).toBeInTheDocument();
    });
  });

  describe("estado inicial", () => {
    it("deve iniciar com o modo desenho desativado", () => {
      render(<DrawingCursor />);

      const cursor = document.querySelector(
        "div.fixed.z-\\[9999\\]"
      );

      expect(cursor).toBeInTheDocument();

      expect(cursor).toHaveStyle({
        backgroundColor: "transparent",
        borderColor: "rgb(255, 255, 255)",
      });
    });

    it("deve iniciar com tamanho de pincel 4", () => {
      render(<DrawingCursor />);

      const range = screen.getByRole("slider");

      expect(range).toHaveValue("4");
    });

    it("deve iniciar com a cor branca", () => {
      render(<DrawingCursor />);

      const colorInput =
        screen.getByDisplayValue("#ffffff");

      expect(colorInput).toBeInTheDocument();
    });
  });

  describe("modo desenho", () => {
    it("deve ativar o modo desenho ao clicar em Desenhar", async () => {
      const user = userEvent.setup();

      render(<DrawingCursor />);

      await user.click(
        screen.getByRole("button", {
          name: /desenhar/i,
        })
      );

     const cursor = screen.getByTestId("drawing-cursor");;

      expect(cursor).toHaveStyle({
        backgroundColor: "rgb(255, 255, 255)",
      });
    });

    it("deve desativar o modo desenho ao clicar em Parar", async () => {
      const user = userEvent.setup();

      render(<DrawingCursor />);

      await user.click(
        screen.getByRole("button", {
          name: /desenhar/i,
        })
      );

      await user.click(
        screen.getByRole("button", {
          name: /parar/i,
        })
      );

      const cursor = document.querySelector(
        "div.fixed.z-\\[9999\\]"
      );

      expect(cursor).toHaveStyle({
        backgroundColor: "transparent",
      });
    });
  });

  describe("desenho", () => {
    it("não deve desenhar quando o modo desenho estiver desativado", () => {
      render(<DrawingCursor />);

      fireEvent.mouseDown(window, {
        button: 0,
        clientX: 100,
        clientY: 100,
      });

      fireEvent.mouseMove(window, {
        clientX: 200,
        clientY: 200,
      });

      fireEvent.mouseUp(window);

      expect(contextMock.stroke).not.toHaveBeenCalled();
      expect(contextMock.fill).not.toHaveBeenCalled();
    });

    it("deve criar um ponto ao clicar com o botão esquerdo", async () => {
      const user = userEvent.setup();

      render(<DrawingCursor />);

      await user.click(
        screen.getByRole("button", {
          name: /desenhar/i,
        })
      );

      fireEvent.mouseDown(window, {
        button: 0,
        clientX: 100,
        clientY: 100,
      });

      expect(contextMock.beginPath).toHaveBeenCalled();

      expect(contextMock.arc).toHaveBeenCalledWith(
        100,
        100,
        2,
        0,
        Math.PI * 2
      );

      expect(contextMock.fill).toHaveBeenCalled();
    });

    it("deve desenhar um segmento ao mover o mouse", async () => {
      const user = userEvent.setup();

      render(<DrawingCursor />);

      await user.click(
        screen.getByRole("button", {
          name: /desenhar/i,
        })
      );

      fireEvent.mouseDown(window, {
        button: 0,
        clientX: 100,
        clientY: 100,
      });

      fireEvent.mouseMove(window, {
        clientX: 200,
        clientY: 200,
      });

      expect(contextMock.moveTo).toHaveBeenCalledWith(
        100,
        100
      );

      expect(contextMock.lineTo).toHaveBeenCalledWith(
        200,
        200
      );

      expect(contextMock.stroke).toHaveBeenCalled();
    });

    it("não deve desenhar com o botão direito", async () => {
      const user = userEvent.setup();

      render(<DrawingCursor />);

      await user.click(
        screen.getByRole("button", {
          name: /desenhar/i,
        })
      );

      fireEvent.mouseDown(window, {
        button: 2,
        clientX: 100,
        clientY: 100,
      });

      fireEvent.mouseMove(window, {
        clientX: 200,
        clientY: 200,
      });

      expect(contextMock.stroke).not.toHaveBeenCalled();
      expect(contextMock.arc).not.toHaveBeenCalled();
    });
  });

  describe("cor do pincel", () => {
    it("deve alterar a cor do pincel", () => {
      render(<DrawingCursor />);

      const colorInput =
        screen.getByDisplayValue("#ffffff");

      fireEvent.change(colorInput, {
        target: {
          value: "#ff0000",
        },
      });

      expect(colorInput).toHaveValue("#ff0000");
    });

    it("deve utilizar a nova cor ao criar um ponto", async () => {
      const user = userEvent.setup();

      render(<DrawingCursor />);

      const colorInput =
        screen.getByDisplayValue("#ffffff");

      fireEvent.change(colorInput, {
        target: {
          value: "#ff0000",
        },
      });

      await user.click(
        screen.getByRole("button", {
          name: /desenhar/i,
        })
      );

      fireEvent.mouseDown(window, {
        button: 0,
        clientX: 100,
        clientY: 100,
      });

      expect(contextMock.fillStyle).toBe("#ff0000");
      expect(contextMock.fill).toHaveBeenCalled();
    });

    it("deve utilizar a nova cor ao desenhar", async () => {
      const user = userEvent.setup();

      render(<DrawingCursor />);

      const colorInput =
        screen.getByDisplayValue("#ffffff");

      fireEvent.change(colorInput, {
        target: {
          value: "#00ff00",
        },
      });

      await user.click(
        screen.getByRole("button", {
          name: /desenhar/i,
        })
      );

      fireEvent.mouseDown(window, {
        button: 0,
        clientX: 100,
        clientY: 100,
      });

      fireEvent.mouseMove(window, {
        clientX: 200,
        clientY: 200,
      });

      expect(contextMock.strokeStyle).toBe("#00ff00");
      expect(contextMock.stroke).toHaveBeenCalled();
    });
  });

  describe("tamanho do pincel", () => {
    it("deve alterar o tamanho do pincel", () => {
      render(<DrawingCursor />);

      const range = screen.getByRole("slider");

      fireEvent.change(range, {
        target: {
          value: "20",
        },
      });

      expect(range).toHaveValue("20");
    });

    it("deve aceitar tamanho mínimo de 1", () => {
      render(<DrawingCursor />);

      const range = screen.getByRole("slider");

      expect(range).toHaveAttribute("min", "1");
    });

    it("deve aceitar tamanho máximo de 30", () => {
      render(<DrawingCursor />);

      const range = screen.getByRole("slider");

      expect(range).toHaveAttribute("max", "30");
    });

    it("deve utilizar o tamanho do pincel no desenho", async () => {
      const user = userEvent.setup();

      render(<DrawingCursor />);

      const range = screen.getByRole("slider");

      fireEvent.change(range, {
        target: {
          value: "20",
        },
      });

      await user.click(
        screen.getByRole("button", {
          name: /desenhar/i,
        })
      );

      fireEvent.mouseDown(window, {
        button: 0,
        clientX: 100,
        clientY: 100,
      });

      expect(contextMock.lineWidth).toBe(20);
    });
  });

  describe("limpar desenho", () => {
    it("deve limpar o canvas ao clicar em Limpar", async () => {
      const user = userEvent.setup();

      render(<DrawingCursor />);

      await user.click(
        screen.getByRole("button", {
          name: /limpar/i,
        })
      );

      expect(contextMock.clearRect).toHaveBeenCalled();
    });

    it("deve limpar o canvas mesmo sem existir desenho", async () => {
      const user = userEvent.setup();

      render(<DrawingCursor />);

      await user.click(
        screen.getByRole("button", {
          name: /limpar/i,
        })
      );

      expect(contextMock.clearRect).toHaveBeenCalledWith(
        0,
        0,
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe("mousemove", () => {
    it("deve atualizar a posição do cursor", () => {
      render(<DrawingCursor />);

      fireEvent.mouseMove(window, {
        clientX: 300,
        clientY: 400,
      });

      const cursor = document.querySelector(
        "div.fixed.z-\\[9999\\]"
      );

      expect(cursor).toHaveStyle({
        transform:
          "translate(300px, 400px) translate(-50%, -50%)",
      });
    });
  });

  describe("mouse leave", () => {
    it("deve interromper o desenho ao sair da janela", async () => {
      const user = userEvent.setup();

      render(<DrawingCursor />);

      await user.click(
        screen.getByRole("button", {
          name: /desenhar/i,
        })
      );

      fireEvent.mouseDown(window, {
        button: 0,
        clientX: 100,
        clientY: 100,
      });

      fireEvent.mouseLeave(window);

      const strokeCallsBefore =
        contextMock.stroke.mock.calls.length;

      fireEvent.mouseMove(window, {
        clientX: 200,
        clientY: 200,
      });

      expect(
        contextMock.stroke.mock.calls.length
      ).toBe(strokeCallsBefore);
    });
  });
});

