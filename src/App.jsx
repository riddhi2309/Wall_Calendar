import { useState, useRef, useCallback, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// US Holidays
const HOLIDAYS = {
  "1-1": "New Year's Day",
  "1-15": "MLK Day",
  "2-14": "Valentine's Day",
  "2-19": "Presidents' Day",
  "3-17": "St. Patrick's Day",
  "4-1": "April Fools'",
  "5-27": "Memorial Day",
  "6-19": "Juneteenth",
  "7-4": "Independence Day",
  "9-2": "Labor Day",
  "10-14": "Columbus Day",
  "10-31": "Halloween 🎃",
  "11-11": "Veterans Day",
  "11-28": "Thanksgiving",
  "12-25": "Christmas 🎄",
  "12-31": "New Year's Eve",
};

// Month hero images (Unsplash — free)
const MONTH_IMAGES = [
  "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=800&q=80", // Jan – snowy mountain
  "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?w=800&q=80", // Feb – flowers
  "https://plus.unsplash.com/premium_photo-1673799490772-2ea0b711e43b?q=80&w=722&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Mar – spring
  "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&q=80", // Apr – cherry blossoms
  "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80", // May – green
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", // Jun – beach
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80", // Jul – summer
  "https://images.unsplash.com/photo-1540039906769-84cf3d448bc1?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Aug – sunflower
  "https://images.unsplash.com/photo-1445855743215-296f71d4b49c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Sep – autumn
  "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=800&q=80", // Oct – pumpkin
  "https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80", // Nov – fall forest
  "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=800&q=80", // Dec – snow
];

// Sticky note colors (warm palette only – no green/blue/black)
const NOTE_COLORS = [
  { bg: "#FFF176", shadow: "#F9A825", label: "Sunny" },
  { bg: "#FFAB91", shadow: "#E64A19", label: "Coral" },
  { bg: "#F8BBD0", shadow: "#C2185B", label: "Rose" },
  { bg: "#FFE0B2", shadow: "#E65100", label: "Peach" },
  { bg: "#FCE4EC", shadow: "#AD1457", label: "Blush" },
  { bg: "#FFF9C4", shadow: "#F57F17", label: "Cream" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
const toKey = (y, m, d) => `${y}-${m + 1}-${d}`;
const holidayKey = (m, d) => `${m + 1}-${d}`;
const today = new Date();

// ─── Sub-components ───────────────────────────────────────────────────────────

// Spiral rings along top
function Spirals() {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center",
      gap:10, padding:"8px 0 0", background:"#f0ebe3",
      borderRadius:"16px 16px 0 0",
    }}>
      {Array.from({length:18}).map((_,i) => (
        <div key={i} style={{
          width:14, height:24,
          background:"linear-gradient(180deg,#c0c0c0 0%,#888 40%,#c0c0c0 60%,#555 100%)",
          borderRadius:"0 0 7px 7px",
          boxShadow:"1px 2px 4px rgba(0,0,0,0.3)",
          border:"1.5px solid #aaa",
          position:"relative",
        }}>
          <div style={{
            position:"absolute", top:-5, left:"50%", transform:"translateX(-50%)",
            width:14, height:14, borderRadius:"50%",
            border:"3px solid #999",
            background:"linear-gradient(135deg,#ddd,#888)",
            boxShadow:"0 2px 4px rgba(0,0,0,0.4)",
          }}/>
        </div>
      ))}
    </div>
  );
}

// 3-D Sticky Note (draggable, in tray)
function StickyNote({ note, onDragStart, onDelete, isOnBoard }) {
  const rotation = note.rotation || 0;
  const color = NOTE_COLORS[note.colorIdx % NOTE_COLORS.length];

  return (
    <div
      draggable={!isOnBoard}
      onDragStart={e => onDragStart && onDragStart(e, note)}
      style={{
        position: isOnBoard ? "absolute" : "relative",
        left: isOnBoard ? note.x : undefined,
        top: isOnBoard ? note.y : undefined,
        width: isOnBoard ? 130 : 100,
        minHeight: isOnBoard ? 110 : 90,
        background: `linear-gradient(160deg, ${color.bg} 60%, ${color.shadow}33 100%)`,
        borderRadius: 3,
        padding: isOnBoard ? "20px 12px 12px" : "14px 10px 10px",
        transform: `rotate(${rotation}deg)`,
        boxShadow: isOnBoard
          ? `3px 6px 18px rgba(0,0,0,0.28), 0 2px 4px rgba(0,0,0,0.18), inset 0 -4px 8px ${color.shadow}44`
          : `2px 4px 10px rgba(0,0,0,0.22), inset 0 -3px 6px ${color.shadow}33`,
        cursor: isOnBoard ? "grab" : "grab",
        zIndex: isOnBoard ? 50 : 1,
        transition: "transform 0.15s, box-shadow 0.15s",
        fontFamily: "'Caveat', cursive",
        fontSize: isOnBoard ? 13 : 11,
        color: "#3a2a1a",
        lineHeight: 1.4,
        wordBreak: "break-word",
        userSelect: "none",
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = `rotate(${rotation}deg) scale(1.07)`;
        e.currentTarget.style.boxShadow = isOnBoard
          ? `6px 12px 28px rgba(0,0,0,0.35), 0 4px 8px rgba(0,0,0,0.2), inset 0 -4px 8px ${color.shadow}44`
          : `4px 8px 16px rgba(0,0,0,0.28), inset 0 -3px 6px ${color.shadow}33`;
        e.currentTarget.style.zIndex = 100;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = `rotate(${rotation}deg) scale(1)`;
        e.currentTarget.style.boxShadow = isOnBoard
          ? `3px 6px 18px rgba(0,0,0,0.28), 0 2px 4px rgba(0,0,0,0.18), inset 0 -4px 8px ${color.shadow}44`
          : `2px 4px 10px rgba(0,0,0,0.22), inset 0 -3px 6px ${color.shadow}33`;
        e.currentTarget.style.zIndex = isOnBoard ? 50 : 1;
      }}
    >
      {/* tape strip at top */}
      <div style={{
        position:"absolute", top:-8, left:"50%", transform:"translateX(-50%)",
        width:40, height:16,
        background:"rgba(255,255,255,0.55)",
        borderRadius:3,
        boxShadow:"0 1px 3px rgba(0,0,0,0.15)",
        backdropFilter:"blur(2px)",
      }}/>
      <div style={{fontSize: isOnBoard ? 10 : 8.5, opacity:0.5, marginBottom:4, textTransform:"uppercase", letterSpacing:1}}>
        {note.dateLabel || "Note"}
      </div>
      <div>{note.text || "(empty)"}</div>
      {onDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(note.id); }}
          style={{
            position:"absolute", top:4, right:4,
            background:"none", border:"none", cursor:"pointer",
            fontSize:12, opacity:0.45, color:"#5a2a1a",
            lineHeight:1, padding:2,
          }}
          title="Remove"
        >✕</button>
      )}
    </div>
  );
}

// Page-flip month transition
function FlipPage({ children, direction, animating }) {
  const style = animating ? {
    animation: `${direction === "next" ? "flipNext" : "flipPrev"} 0.6s cubic-bezier(0.4,0,0.2,1) forwards`,
  } : {};
  return (
    <div style={{ position:"relative", ...style }}>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WallCalendar() {
  const [currentDate, setCurrentDate] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [flip, setFlip] = useState({ animating: false, direction: "next" });
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);

  // Notes
  const [noteText, setNoteText] = useState("");
  const [noteColorIdx, setNoteColorIdx] = useState(0);
  const [boardNotes, setBoardNotes] = useState([
    { id:1, text:"Team sync", colorIdx:0, x:20, y:20, rotation:-3, dateLabel:"Jan 5–8" },
    { id:2, text:"Project deadline!", colorIdx:1, x:165, y:40, rotation:2, dateLabel:"Jan 15" },
  ]);
  const [trayNotes, setTrayNotes] = useState([]);
  const [draggingNote, setDraggingNote] = useState(null);
  const boardRef = useRef(null);
  const nextIdRef = useRef(10);

  const { year, month } = currentDate;

  // Month navigation with flip animation
  const navigate = useCallback((dir) => {
    if (flip.animating) return;
    setFlip({ animating: true, direction: dir });
    setTimeout(() => {
      setCurrentDate(prev => {
        let m = prev.month + (dir === "next" ? 1 : -1);
        let y = prev.year;
        if (m > 11) { m = 0; y++; }
        if (m < 0) { m = 11; y--; }
        return { year: y, month: m };
      });
      setFlip({ animating: false, direction: dir });
      setRangeStart(null);
      setRangeEnd(null);
    }, 550);
  }, [flip.animating]);

  // Build calendar grid
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevDays = getDaysInMonth(year, month - 1 < 0 ? 11 : month - 1);
  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: prevDays - firstDay + 1 + i, current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false });
  }

  // Date selection
  const handleDayClick = (day, current) => {
    if (!current) return;
    const clicked = new Date(year, month, day);
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(clicked);
      setRangeEnd(null);
    } else {
      if (clicked < rangeStart) {
        setRangeEnd(rangeStart);
        setRangeStart(clicked);
      } else {
        setRangeEnd(clicked);
      }
    }
  };

  const isStart = (d) => rangeStart && rangeStart.getFullYear()===year && rangeStart.getMonth()===month && rangeStart.getDate()===d;
  const isEnd = (d) => rangeEnd && rangeEnd.getFullYear()===year && rangeEnd.getMonth()===month && rangeEnd.getDate()===d;
  const isInRange = (d) => {
    if (!rangeStart || !rangeEnd) return false;
    const dt = new Date(year, month, d);
    return dt > rangeStart && dt < rangeEnd;
  };
  const isHovered = (d) => {
    if (!rangeStart || rangeEnd || !hoverDate) return false;
    const dt = new Date(year, month, d);
    return dt > rangeStart && dt <= hoverDate;
  };
  const isToday = (d) => d===today.getDate() && month===today.getMonth() && year===today.getFullYear();

  // Drag sticky note to board
  const handleDragStart = (e, note) => {
    setDraggingNote(note);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleBoardDrop = (e) => {
    e.preventDefault();
    if (!draggingNote || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 65;
    const y = e.clientY - rect.top - 55;
    const rotation = Math.random()*10 - 5;
    setBoardNotes(prev => [...prev, { ...draggingNote, id: nextIdRef.current++, x, y, rotation }]);
    setTrayNotes(prev => prev.filter(n => n.id !== draggingNote.id));
    setDraggingNote(null);
  };

  // Add note to tray
  const addNote = () => {
    if (!noteText.trim()) return;
    const dateLabel = rangeStart
      ? rangeEnd
        ? `${MONTHS[rangeStart.getMonth()].slice(0,3)} ${rangeStart.getDate()}–${rangeEnd.getDate()}`
        : `${MONTHS[rangeStart.getMonth()].slice(0,3)} ${rangeStart.getDate()}`
      : MONTHS[month];
    setTrayNotes(prev => [...prev, {
      id: nextIdRef.current++,
      text: noteText.trim(),
      colorIdx: noteColorIdx,
      rotation: Math.random()*8-4,
      dateLabel,
      x: 20, y: 20,
    }]);
    setNoteText("");
  };

  const deleteBoard = (id) => setBoardNotes(prev => prev.filter(n => n.id !== id));
  const deleteTray = (id) => setTrayNotes(prev => prev.filter(n => n.id !== id));

  // Range label
  const rangeLabel = rangeStart
    ? rangeEnd
      ? `${MONTHS[rangeStart.getMonth()]} ${rangeStart.getDate()} → ${MONTHS[rangeEnd.getMonth()]} ${rangeEnd.getDate()}, ${rangeEnd.getFullYear()}`
      : `From ${MONTHS[rangeStart.getMonth()]} ${rangeStart.getDate()} — pick end date`
    : "Click a date to start your range";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Caveat:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }

        body {
          min-height: 100vh;
          background: #e8e0d5;
          background-image:
            radial-gradient(ellipse at 20% 20%, #d4c5b0 0%, transparent 60%),
            radial-gradient(ellipse at 80% 80%, #c9b99e 0%, transparent 60%);
          font-family: 'DM Sans', sans-serif;
          display:flex; align-items:flex-start; justify-content:center;
          padding: 40px 16px 60px;
        }

        @keyframes flipNext {
          0%   { transform: perspective(1200px) rotateX(0deg); opacity:1; transform-origin:top center; }
          50%  { transform: perspective(1200px) rotateX(-90deg); opacity:0; transform-origin:top center; }
          51%  { transform: perspective(1200px) rotateX(90deg); opacity:0; transform-origin:bottom center; }
          100% { transform: perspective(1200px) rotateX(0deg); opacity:1; transform-origin:bottom center; }
        }
        @keyframes flipPrev {
          0%   { transform: perspective(1200px) rotateX(0deg); opacity:1; transform-origin:bottom center; }
          50%  { transform: perspective(1200px) rotateX(90deg); opacity:0; transform-origin:bottom center; }
          51%  { transform: perspective(1200px) rotateX(-90deg); opacity:0; transform-origin:top center; }
          100% { transform: perspective(1200px) rotateX(0deg); opacity:1; transform-origin:top center; }
        }
        @keyframes noteFloat {
          0%,100% { transform: translateY(0px) rotate(var(--r,0deg)); }
          50% { transform: translateY(-4px) rotate(var(--r,0deg)); }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes popIn {
          0% { transform: scale(0.7) rotate(-8deg); opacity:0; }
          80% { transform: scale(1.08) rotate(2deg); opacity:1; }
          100% { transform: scale(1) rotate(var(--r,0deg)); opacity:1; }
        }

        .calendar-wrapper {
          width: 100%;
          max-width: 980px;
        }

        .calendar-card {
          background: #fdf8f2;
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 30px 80px rgba(100,70,40,0.22),
            0 8px 20px rgba(100,70,40,0.12),
            inset 0 1px 0 rgba(255,255,255,0.8);
          position: relative;
        }

        .calendar-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 520px;
        }

        /* LEFT – image panel */
        .image-panel {
          position: relative;
          overflow: hidden;
          min-height: 400px;
        }
        .hero-img {
          width:100%; height:100%;
          object-fit:cover;
          transition: transform 0.8s ease;
        }
        .image-panel:hover .hero-img { transform: scale(1.04); }
        .img-overlay {
          position:absolute; inset:0;
          background: linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%);
        }
        .month-badge {
          position:absolute; bottom:0; right:0;
          background: linear-gradient(135deg, #ff6b35, #f7c59f);
          padding: 18px 24px;
          clip-path: polygon(24px 0, 100% 0, 100% 100%, 0 100%);
          text-align:right;
        }
        .month-badge .year { font-family:'DM Sans',sans-serif; font-size:13px; color:rgba(255,255,255,0.8); letter-spacing:3px; }
        .month-badge .month-name { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:#fff; line-height:1; }

        /* RIGHT – calendar grid */
        .grid-panel {
          padding: 24px 20px 20px;
          display:flex; flex-direction:column; gap:12px;
        }
        .day-headers {
          display:grid; grid-template-columns:repeat(7,1fr);
          gap:2px;
        }
        .day-header {
          text-align:center;
          font-size:10px;
          font-weight:500;
          letter-spacing:1.5px;
          text-transform:uppercase;
          color:#b89880;
          padding-bottom:6px;
          border-bottom: 1px solid #e8ddd4;
        }
        .day-header.weekend { color: #e07a5f; }
        .days-grid {
          display:grid; grid-template-columns:repeat(7,1fr);
          gap:3px;
        }
        .day-cell {
          aspect-ratio: 1;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          border-radius:8px;
          font-size:13px;
          font-weight:400;
          cursor:pointer;
          position:relative;
          transition: all 0.18s ease;
          color: #3d2b1f;
          user-select:none;
        }
        .day-cell.other-month { color: #ccc0b5; cursor:default; }
        .day-cell.weekend { color: #e07a5f; }
        .day-cell.today::after {
          content:'';
          position:absolute; bottom:3px; left:50%; transform:translateX(-50%);
          width:4px; height:4px; border-radius:50%;
          background: #e07a5f;
        }
        .day-cell.today { font-weight:700; }
        .day-cell.range-start, .day-cell.range-end {
          background: linear-gradient(135deg, #ff6b35, #f7a464) !important;
          color: #fff !important;
          font-weight:700;
          box-shadow: 0 4px 14px rgba(255,107,53,0.45);
          transform: scale(1.12);
          z-index:2;
        }
        .day-cell.range-in {
          background: linear-gradient(90deg, #ffe5d9, #ffd0bc);
          color: #c05020;
          border-radius:0;
        }
        .day-cell.range-in:first-child, .day-cell.range-start + .day-cell { border-radius: 0; }
        .day-cell.range-hover {
          background: #fff0ea;
          color: #c05020;
        }
        .day-cell.has-holiday::before {
          content:'';
          position:absolute; top:3px; right:3px;
          width:5px; height:5px; border-radius:50%;
          background: #ffb347;
          box-shadow: 0 0 4px #ffb347;
        }
        .day-cell:not(.other-month):not(.range-start):not(.range-end):hover {
          background: #ffeee6;
          transform: scale(1.08);
        }
        .holiday-tooltip {
          position:absolute; top:-28px; left:50%; transform:translateX(-50%);
          background:#3d2b1f; color:#fff;
          font-size:9px; padding:3px 7px; border-radius:6px;
          white-space:nowrap; pointer-events:none;
          opacity:0; transition:opacity 0.2s;
          z-index:99;
        }
        .day-cell.has-holiday:hover .holiday-tooltip { opacity:1; }

        /* Range info bar */
        .range-bar {
          display:flex; align-items:center; justify-content:space-between;
          padding: 8px 12px;
          background: linear-gradient(90deg, #fff5f0, #fff8f5);
          border-radius:10px;
          border: 1px solid #f0ddd4;
          font-size:11.5px; color:#7a4a35;
          flex-wrap:wrap; gap:6px;
        }
        .range-bar .label { font-family:'Caveat',cursive; font-size:14px; color:#e07a5f; }
        .clear-btn {
          background:none; border:1px solid #e8c4b0; border-radius:6px;
          font-size:10px; color:#b07060; padding:3px 8px; cursor:pointer;
        }
        .clear-btn:hover { background:#ffeee6; }

        /* ── Notes area ─────────────────────────────── */
        .notes-section {
          border-top: 1px solid #e8ddd4;
          padding: 20px 24px;
        }
        .notes-header {
          font-family:'Playfair Display',serif;
          font-size:15px; font-style:italic; color:#7a4a35;
          margin-bottom:14px;
          display:flex; align-items:center; gap:8px;
        }
        .notes-layout {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:20px;
        }

        /* note compose */
        .note-compose { display:flex; flex-direction:column; gap:8px; }
        .note-compose textarea {
          background: #FFF9C4;
          border:none; border-radius:6px;
          padding:10px 12px;
          font-family:'Caveat',cursive; font-size:15px; color:#3d2b1f;
          resize:vertical; min-height:80px;
          box-shadow: 2px 3px 8px rgba(0,0,0,0.1), inset 0 -3px 6px #F9A82533;
          outline:none;
          transition: box-shadow 0.2s;
        }
        .note-compose textarea:focus {
          box-shadow: 2px 3px 14px rgba(0,0,0,0.16), inset 0 -3px 6px #F9A82544;
        }
        .note-colors { display:flex; gap:6px; align-items:center; }
        .color-dot {
          width:20px; height:20px; border-radius:50%;
          cursor:pointer; transition:transform 0.15s;
          border:2px solid transparent;
        }
        .color-dot.active { transform:scale(1.35); border-color:#3d2b1f; }
        .add-note-btn {
          padding:9px 18px;
          background:linear-gradient(135deg,#ff6b35,#f7a464);
          color:#fff; border:none; border-radius:8px;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500;
          cursor:pointer; align-self:flex-start;
          box-shadow:0 4px 12px rgba(255,107,53,0.3);
          transition: all 0.2s;
        }
        .add-note-btn:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(255,107,53,0.4); }

        /* tray */
        .note-tray {
          display:flex; flex-wrap:wrap; gap:12px;
          align-content:flex-start;
          min-height:80px;
          background: #f5ece0;
          border-radius:10px;
          padding:10px;
          border:2px dashed #ddd0c4;
          position:relative;
        }
        .tray-label {
          font-size:10px; text-transform:uppercase; letter-spacing:1.5px;
          color:#b89880; position:absolute; top:8px; right:12px;
        }

        /* BOARD OVERLAY (drag target) */
        .board-overlay {
          position:absolute; inset:0;
          pointer-events:none;
          z-index:10;
        }
        .board-overlay.active { pointer-events:all; }

        /* nav arrows */
        .nav-btn {
          background: rgba(255,255,255,0.85);
          border:none; border-radius:50%;
          width:36px; height:36px;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer;
          box-shadow:0 2px 8px rgba(0,0,0,0.15);
          font-size:16px; color:#7a4a35;
          transition:all 0.2s;
          backdrop-filter:blur(4px);
        }
        .nav-btn:hover { background:#fff; transform:scale(1.1); box-shadow:0 4px 14px rgba(0,0,0,0.2); }

        /* ── Responsive ──────────────────────────────── */
        @media (max-width: 720px) {
          body { padding: 20px 10px 50px; }
          .calendar-body { grid-template-columns:1fr; }
          .image-panel { min-height:200px; max-height:240px; }
          .notes-layout { grid-template-columns:1fr; }
          .grid-panel { padding:16px 12px; }
          .day-cell { font-size:12px; border-radius:6px; }
        }
        @media (max-width: 420px) {
          .day-cell { font-size:10px; }
          .month-badge .month-name { font-size:20px; }
        }
      `}</style>

      <div className="calendar-wrapper">
        {/* ── Wall shadow + paper texture ── */}
        <div style={{
          position:"relative",
          filter:"drop-shadow(0 40px 60px rgba(80,50,20,0.25))",
        }}>

          <div className="calendar-card">
            {/* Spirals */}
            <Spirals />

            {/* Main body: image | grid */}
            <FlipPage direction={flip.direction} animating={flip.animating}>
              <div
                className="calendar-body"
                ref={boardRef}
                onDragOver={e => e.preventDefault()}
                onDrop={handleBoardDrop}
                style={{ position:"relative" }}
              >
                {/* board notes layer */}
                {boardNotes.map(note => (
                  <div
                    key={note.id}
                    style={{
                      position:"absolute",
                      left:note.x, top:note.y,
                      zIndex:50,
                      animation:`popIn 0.4s ease forwards`,
                      "--r": `${note.rotation}deg`,
                    }}
                  >
                    <StickyNote note={note} onDelete={deleteBoard} isOnBoard />
                  </div>
                ))}

                {/* LEFT: hero image */}
                <div className="image-panel" style={{position:"relative"}}>
                  <img
                    className="hero-img"
                    src={MONTH_IMAGES[month]}
                    alt={MONTHS[month]}
                  />
                  <div className="img-overlay"/>
                  {/* nav arrows */}
                  <div style={{
                    position:"absolute", top:"50%", transform:"translateY(-50%)",
                    left:12, display:"flex", flexDirection:"column", gap:8,
                  }}>
                    <button className="nav-btn" onClick={() => navigate("prev")} title="Previous month">‹</button>
                    <button className="nav-btn" onClick={() => navigate("next")} title="Next month">›</button>
                  </div>
                  <div className="month-badge">
                    <div className="year">{year}</div>
                    <div className="month-name">{MONTHS[month].toUpperCase()}</div>
                  </div>
                </div>

                {/* RIGHT: calendar grid */}
                <div className="grid-panel">
                  {/* Range bar */}
                  <div className="range-bar">
                    <span className="label">📅 {rangeLabel}</span>
                    {rangeStart && (
                      <button className="clear-btn" onClick={() => { setRangeStart(null); setRangeEnd(null); }}>
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Day headers */}
                  <div className="day-headers">
                    {DAYS_SHORT.map((d,i) => (
                      <div key={d} className={`day-header${i===0||i===6?" weekend":""}`}>{d}</div>
                    ))}
                  </div>

                  {/* Days */}
                  <div className="days-grid">
                    {cells.map((cell, i) => {
                      const hol = cell.current && HOLIDAYS[holidayKey(month, cell.day)];
                      const classes = [
                        "day-cell",
                        !cell.current ? "other-month" : "",
                        cell.current && (i%7===0||i%7===6) ? "weekend" : "",
                        cell.current && isToday(cell.day) ? "today" : "",
                        cell.current && isStart(cell.day) ? "range-start" : "",
                        cell.current && isEnd(cell.day) ? "range-end" : "",
                        cell.current && isInRange(cell.day) ? "range-in" : "",
                        cell.current && isHovered(cell.day) ? "range-hover" : "",
                        hol ? "has-holiday" : "",
                      ].filter(Boolean).join(" ");

                      return (
                        <div
                          key={i}
                          className={classes}
                          onClick={() => handleDayClick(cell.day, cell.current)}
                          onMouseEnter={() => cell.current && setHoverDate(new Date(year, month, cell.day))}
                          onMouseLeave={() => setHoverDate(null)}
                        >
                          {cell.day}
                          {hol && <div className="holiday-tooltip">{hol}</div>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Weekday legend */}
                  <div style={{display:"flex", gap:12, fontSize:10, color:"#b89880", paddingTop:4}}>
                    <span style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:"#ffb347",display:"inline-block"}}/>
                      Holiday
                    </span>
                    <span style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{width:8,height:8,borderRadius:2,background:"linear-gradient(135deg,#ff6b35,#f7a464)",display:"inline-block"}}/>
                      Selected
                    </span>
                    <span style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{width:8,height:8,borderRadius:2,background:"#ffd0bc",display:"inline-block"}}/>
                      In range
                    </span>
                  </div>
                </div>
              </div>
            </FlipPage>

            {/* ── Notes section ── */}
            <div className="notes-section">
              <div className="notes-header">
                <span>📌</span> Sticky Notes
                <span style={{marginLeft:"auto",fontSize:10,color:"#c0a090",fontFamily:"'DM Sans',sans-serif",fontStyle:"normal"}}>
                  Write → Add to tray → Drag onto calendar
                </span>
              </div>
              <div className="notes-layout">
                {/* Compose */}
                <div className="note-compose">
                  <textarea
                    placeholder="Jot a note…"
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    onKeyDown={e => { if(e.key==="Enter"&&e.metaKey) addNote(); }}
                    style={{ background: NOTE_COLORS[noteColorIdx].bg }}
                  />
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                    <div className="note-colors">
                      {NOTE_COLORS.map((c,i) => (
                        <div
                          key={i}
                          className={`color-dot${i===noteColorIdx?" active":""}`}
                          style={{background:c.bg, boxShadow:`0 2px 6px ${c.shadow}66`}}
                          onClick={() => setNoteColorIdx(i)}
                          title={c.label}
                        />
                      ))}
                    </div>
                    <button className="add-note-btn" onClick={addNote}>
                      + Add to Tray
                    </button>
                  </div>
                </div>

                {/* Tray */}
                <div className="note-tray">
                  <span className="tray-label">Drag to calendar ↑</span>
                  {trayNotes.length === 0 && (
                    <div style={{color:"#c0a090",fontSize:12,marginTop:24,width:"100%",textAlign:"center"}}>
                      No notes yet — write one!
                    </div>
                  )}
                  {trayNotes.map(note => (
                    <div
                      key={note.id}
                      style={{animation:`popIn 0.35s ease forwards`, "--r":`${note.rotation}deg`}}
                    >
                      <StickyNote
                        note={note}
                        onDragStart={handleDragStart}
                        onDelete={deleteTray}
                        isOnBoard={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Paper texture bottom strip */}
            <div style={{
              height:8,
              background:"linear-gradient(180deg,#ede4d8,#e0d5c4)",
              borderTop:"1px solid #d8cfc4",
            }}/>
          </div>

          {/* Cast shadow under calendar */}
          <div style={{
            height:20, marginTop:-8,
            background:"radial-gradient(ellipse at 50% 0%, rgba(80,50,20,0.18) 0%, transparent 80%)",
            borderRadius:"0 0 50% 50%",
          }}/>
        </div>

        {/* Caption */}
        <div style={{
          textAlign:"center", marginTop:20,
          fontFamily:"'Playfair Display',serif", fontStyle:"italic",
          fontSize:13, color:"#a08060", letterSpacing:1,
        }}>
          Interactive Wall Calendar — drag sticky notes onto your dates ✦
        </div>
      </div>
    </>
  );
}
