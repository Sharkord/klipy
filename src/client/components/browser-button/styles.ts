import type { CSSProperties } from "react";

const panelStyle: CSSProperties = {
  width: "min(720px, calc(100vw - 24px))",
  height: "min(520px, calc(100vh - 96px))",
  maxWidth: "none",
  padding: 12,
  overflow: "hidden",
};

const bodyStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  height: "100%",
  minHeight: 0,
};

const tabPanelStyle: CSSProperties = {
  display: "flex",
  flex: 1,
  flexDirection: "column",
  gap: 12,
  minHeight: 0,
};

const contentStyle: CSSProperties = {
  display: "flex",
  flex: 1,
  flexDirection: "column",
  minHeight: 0,
};

const statusTextStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: "var(--muted-foreground)",
};

const emptyStateStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "var(--muted-foreground)",
};

const gridStyle: CSSProperties = {
  width: "100%",
  flex: 1,
  minHeight: 0,
  boxSizing: "border-box",
  overflowY: "auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
  gridAutoRows: 120,
  gap: 8,
  paddingRight: 4,
  alignContent: "start",
};

const cardStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  borderRadius: 8,
  border: "1px solid var(--border)",
  overflow: "hidden",
};

const imageButtonStyle: CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  padding: 0,
  border: "none",
  background: "transparent",
  cursor: "pointer",
};

const favoriteButtonStyle: CSSProperties = {
  position: "absolute",
  top: 4,
  right: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 22,
  height: 22,
  padding: 0,
  border: "none",
  borderRadius: 999,
  background: "rgba(0, 0, 0, 0.55)",
  color: "#fff",
  cursor: "pointer",
};

const imageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const loadingMoreStyle: CSSProperties = {
  gridColumn: "1 / -1",
  margin: 0,
  padding: "4px 0",
  textAlign: "center",
  fontSize: 12,
  color: "var(--muted-foreground)",
};

export {
  bodyStyle,
  cardStyle,
  contentStyle,
  emptyStateStyle,
  favoriteButtonStyle,
  gridStyle,
  imageButtonStyle,
  imageStyle,
  loadingMoreStyle,
  panelStyle,
  statusTextStyle,
  tabPanelStyle,
};
