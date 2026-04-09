# Interactive Wall Calendar 🗓️📌

A beautiful, skeuomorphic wall calendar built with **React**. This component features smooth page-flip animations, interactive date range selection, and fully draggable 3D sticky notes to help you visually organize your schedule.

---

## ✨ Features

* **Dynamic Calendar Grid:** Navigate seamlessly between months with satisfying CSS page-flip animations.
* **Date Range Selection:** Click once to select a start date, and click again to pick an end date. The range highlights automatically.
* **Draggable Sticky Notes:** Type a note, pick a color from a warm aesthetic palette, and drag it anywhere onto the calendar board.
* **US Holidays Included:** Built-in holiday indicators (a small orange dot) reveal the holiday name on hover.
* **Beautiful UI:** Features realistic spiral binding rings, paper textures, drop shadows, and curated Unsplash hero images tailored to each month.
* **Responsive Design:** Adapts cleanly to mobile, tablet, and desktop screens.

---

## 🛠️ Tech Stack

* **Framework:** React (Functional Components, `useState`, `useRef`, `useCallback`, `useEffect`)
* **Styling:** Vanilla CSS (CSS Grid, Flexbox, Keyframe Animations, CSS Variables)
* **Fonts:** Google Fonts (`Playfair Display`, `Caveat`, `DM Sans`)

---

## 🚀 Getting Started

If you are dropping this component into an existing React project, simply copy the `App.jsx` code into your desired file.

### Setup from scratch using Vite:

1.  **Create a new React project:**
    ```bash
    npm create vite@latest wall-calendar -- --template react
    cd wall-calendar
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Add the component:**
    Replace the contents of `src/App.jsx` with the provided calendar code.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

---

## 🖱️ How to Use

* **Change Months:** Use the `<` and `>` arrows over the hero image on the left.
* **Select Dates:** Click any day on the grid to start a range. Click another day to end it. Click the **Clear** button in the top right of the grid to reset.
* **Create Notes:** Scroll down to the "Sticky Notes" section. Type a message, select a color dot, and click **+ Add to Tray**.
* **Place Notes:** Click and drag any note from the bottom tray directly onto the upper calendar board.
* **Delete Notes:** Click the small **✕** in the top right corner of any note to remove it.

---

## 🎨 Customization

You can easily customize the calendar by tweaking the constants at the top of the `App.jsx` file:

* **Images:** Update the `MONTH_IMAGES` array with your own image URLs (12 slots, Jan-Dec).
* **Holidays:** Add or remove dates in the `HOLIDAYS` object using the `"month-day"` key format (e.g., `"10-31": "Halloween 🎃"`).
* **Colors:** Adjust the sticky note colors by editing the `NOTE_COLORS` array.

---

## 📄 License

This project is open-source and free to use or modify for personal or commercial projects.