export default function HUD() {
  return (
    <div className="hud">
      <div className="hud-panel">
        <div className="hud-header">
          <span className="hud-dot" />
          FLIGHT CONTROLS
        </div>
        <div className="hud-row"><span className="hud-key">W / S</span><span className="hud-label">Thrust / Reverse</span></div>
        <div className="hud-row"><span className="hud-key">A / D</span><span className="hud-label">Steer Left / Right</span></div>
        <div className="hud-row"><span className="hud-key">R / F</span><span className="hud-label">Ascend / Descend</span></div>
        <div className="hud-row"><span className="hud-key">SHIFT</span><span className="hud-label">Boost</span></div>
      </div>
    </div>
  )
}
