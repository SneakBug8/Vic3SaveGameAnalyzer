const colors = ["red", "blue", "green", "yellow", "darkmagenta", "cyan", "darkgreen",
  "orange", "pink"];

const alphacolors = ["rgba(255, 0, 0, 0.5)", "rgba(0,0,255,0.5)", "rgba(0,255,0,0.5)",
  "yellow", "darkmagenta", "cyan", "darkgreen",
"orange", "pink"];

const backgrounds = ["#dc3545", "#fd7e14", "#ffc107", "#198754", "#20c997", "#0dcaf0", "#0d6efd", "#6610f2", "#6f42c1",  "#d63384"];

export class Color
{
  public static GetColor(index: number)
  {
    return colors[index % colors.length];
  }

  public static GetAlphaColor(index: number)
  {
    return alphacolors[index % colors.length];
  }

  public static GetBackground(index: number)
  {
    return backgrounds[index % backgrounds.length];
  }
}