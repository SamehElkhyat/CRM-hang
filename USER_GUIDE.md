# How to Use This System — Step-by-Step Guide

This is an operating manual for the reservations & operations platform: what each screen does, in what order you'd actually use them, and what happens behind the scenes at each step. Arabic UI labels are quoted alongside the English explanation so you can match this guide to exactly what's on your screen.

If you want the "what does this project do and why" architectural version instead, see `PROJECT_OVERVIEW.md`. If you're setting up the project for the first time, see `README.md`.

---

## 0. The two roles, in one paragraph

Everyone signs in as either an **agent** (عضو فريق) or an **admin** (مسؤول). Agents handle the day-to-day: entering bookings, chatting about them, drafting and sending emails. Admins do everything agents do, *plus* manage the hotel directory and see team-wide performance reports. New accounts always start as an agent — an existing admin has to promote you (there's no self-service signup or self-promotion; this is enforced by the database, not just hidden buttons).

---

## 1. Signing in

Go to the app's login page, enter your email and password, and you land on the dashboard. There's no "forgot password" self-service flow shown here — if you're locked out, an admin needs to help via the Supabase dashboard.

If your account was just created, you're an **agent** by default, even if you're meant to be an admin — someone with existing admin access needs to promote you first (see `README.md` → "Bootstrap the first admin").

---

## 2. The Dashboard (لوحة التحكم) — your home screen

The first thing you see after logging in. It shows:

- **إجمالي الحجوزات** (Total bookings) — every booking in the system, ever
- **قيد المراجعة** (Pending) — bookings still being worked
- **تم إرسال البريد** (Email sent) — bookings where a reply already went out to the hotel
- **الفنادق النشطة** (Active hotels) — how many hotels are in your directory
- **أحدث الحجوزات** (Recent bookings) — a live list of the last 5 bookings, click any row to jump to its detail page

Use this page as a quick pulse-check when you start your shift — it tells you at a glance how much is in the pipeline and what needs attention.

---

## 3. Adding a new booking

Click **"إضافة حجز"** (Add Booking) from the sidebar or the Bookings page, or **"إضافة حجز جديد"** from the dashboard. This opens the booking form.

### 3.1 Fill in the form

| Field | Required? | Notes |
|---|---|---|
| الفندق (Hotel) | **Yes** | Pick from the dropdown — this is your hotel directory (see §8). Selecting a hotel shows its room categories as clickable chips underneath, pre-filled with that room's rate. |
| اسم الضيف (Guest name) | **Yes** | The person actually staying. |
| رقم الهاتف (Phone) | No | Optional but useful for follow-up. |
| تاريخ الوصول / تاريخ المغادرة (Check-in / Check-out) | **Yes** | Both dates — the system needs these for duplicate-checking and cost math. |
| فئة الغرفة (Room category) | No | Click one of the hotel's room chips to auto-fill this + the rate, or type your own. |
| نظام الإعاشة (Meal plan) | No | e.g. half board, breakfast only. |
| السعر لليلة (Rate per night) | No | Auto-fills when you click a room chip; editable if the hotel gave you a special rate. |
| العملة (Currency) | No | Defaults to EGP. |
| أعمار الأطفال (Children's ages) | No | Comma-separated, e.g. `4, 9`. Drives the cost breakdown in §3.3. |
| الوصف / ملاحظات (Description/notes) | No | Free text — anything about this booking worth recording. |

### 3.2 Check for duplicates

Click **"التحقق من التكرار"** (Check for duplicates) once you've filled in the hotel, guest name, and both dates. The system searches for existing bookings **at that same hotel** with **overlapping dates** and a **similar guest name**, and shows you any matches with a similarity percentage. This is not an AI guess — it's a database-level fuzzy-match on the name (handles Arabic spelling variations like "أحمد" vs "احمد") combined with an actual date-overlap check. If it finds nothing, you'll see a green "لا توجد حجوزات مشابهة ✓" confirmation. Nothing is ever auto-blocked — you decide whether a flagged match is really a duplicate or just a coincidence.

### 3.3 Review the cost

Once a rate and dates are filled in, a **"حساب التكلفة"** (Cost calculation) card appears automatically, breaking down:
- Room subtotal (nights × rate)
- A line per child, based on the hotel's child policy (free below a certain age, extra-bed charge in a middle bracket, full adult-equivalent charge above that)
- The total

This is plain arithmetic pulled from the hotel's stored policy — nothing here is estimated or AI-generated.

### 3.4 Save it

Click **"حفظ الحجز"** (Save Booking). You're taken straight to the new booking's detail page. From this moment, everyone on the team can see this booking, and you're automatically **following** it (see §6.3).

---

## 4. The Bookings list (الحجوزات)

Shows every booking, newest first, with two tabs:
- **الكل** (All) — everything in the system
- **متابعاتي** (My follows) — only bookings you created or are following (see §6.3)

Each row shows the guest, hotel, dates, total cost, and a color-coded status pill. Click any row to open its detail page.

---

## 5. The Booking detail page — the hub for everything about one booking

This is where most of the day-to-day work happens. Top to bottom:

### 5.1 Header actions
- **متابعة / إلغاء المتابعة** (Follow / Unfollow) — toggle whether you get notified about activity on this booking (§6.3).
- **Status dropdown** — pending (قيد المراجعة) → confirmed (مؤكد) → sent (تم الإرسال) → cancelled (ملغى). Changing this **automatically posts a message in the chat thread** ("فلان غيّر الحالة إلى: مؤكد") so the whole team sees the outcome without you having to announce it separately.
- **استوديو البريد** (Email Studio button) — jumps to the email workflow for this booking (§7), with a badge showing how many drafts already exist.

### 5.2 Detail cards
- **تفاصيل الحجز** (Booking details) — room category, meal plan, guest phone, children's ages.
- **التواصل مع الفندق** (Hotel contact) — the hotel's hotline, reservation email, and sales email, pulled straight from the directory so you never have to look it up separately.
- **تفاصيل التكلفة** (Cost breakdown) — same math as §3.3, recalculated live from the stored rate and dates.
- **الوصف / ملاحظات** (Description/notes) — whatever was typed in when the booking was created.

### 5.3 سجل التعديلات (Change history / audit log)
A timeline of everything that's happened to this booking's record: who created it, and every subsequent edit as a field-by-field diff (old value struck through, new value beside it). This is written automatically by the database every time the row changes — nobody can turn it off or edit it after the fact, so it's a reliable record for resolving "who changed what" questions.

### 5.4 المحادثة (The live chat) — right-hand panel
A real-time chat thread scoped to this one booking. This exists because the person who takes the initial request (usually an agent) often isn't the person who actually calls the hotel and finalizes things (usually an admin) — they need a shared place to hand off.

- Type a message and hit send (or Enter) — it appears instantly for anyone else viewing this booking, no refresh needed.
- Status changes appear as centered system messages automatically (see §5.1).
- A small "مباشر" (Live) pulse indicator confirms you're connected to real-time updates.

---

## 6. Notifications

### 6.1 The bell icon (top bar)
Shows a live unread-count badge. Click it to see a dropdown of every booking with unread activity — guest name, hotel, a preview of the latest message, and how long ago. Clicking an entry takes you straight to that booking.

### 6.2 Who gets notified about what
- The agent who **created** a booking gets notified about new activity on it.
- Anyone **following** a booking (whether they created it or not) gets notified.
- **Admins get notified about every booking**, since they need visibility across the whole pipeline.

### 6.3 Following a booking you didn't create
If a colleague created a booking but you want to keep an eye on it (maybe you're covering for them, or it involves a hotel you specialize in), open it and click **"متابعة"**. You'll start getting the same live notifications as the creator does.

---

## 7. Email Studio — drafting and sending the reply to the hotel

Reached via the button on a booking's detail page.

1. Click **"مسودة جديدة"** (New draft) to start a blank draft in the editor pane.
2. Type the subject and body yourself — there's no auto-generation, you're in full control of the wording.
3. Click **"حفظ"** (Save) to persist your edits. You can save as many times as you like before sending.
4. Click **"إرسال البريد"** (Send email) when it's ready. This sends via your configured email provider to the hotel's reservation email (and cc's the sales email if the hotel directory has one on file). You'll get a confirmation prompt before it actually goes out.
5. The **left sidebar** keeps every draft ever created for this booking — including old ones you didn't send — so there's a full paper trail of what was proposed and what actually went to the hotel.

**Guardrails:** you can't send a blank email, and you can't send if you have unsaved edits sitting in the editor — save first, then send.

---

## 8. Hotel Directory (دليل الفنادق)

The shared source of truth that the booking form, cost calculator, and Email Studio all depend on.

- **Everyone** can view the full list and every hotel's details (read-only for agents).
- **Only admins** can add a new hotel or edit an existing one — the "إضافة فندق" button and edit forms are simply not available to agents, and the database itself blocks the write even if someone tried to force it through the API.

Each hotel record has:
- **Contacts:** hotline, reservation email, sales email, finance email
- **Room categories:** a list of room types with a base nightly rate each — these are what populate the clickable rate-chips in the booking form
- **Child policy:** the free-stay age cutoff, an age bracket that requires a paid extra bed, and a fallback charge for anyone older — this directly drives the cost calculator in §3.3

---

## 9. Team (الفريق) — admin only

Not visible in the sidebar at all for agents, and blocked server-side even if an agent tries the URL directly. For admins, it's a three-level drill-down:

1. **`/team`** — every team member and their total booking count, busiest first.
2. Click a person → the **hotels they've personally booked at**, with a count per hotel.
3. Click a hotel → the **actual list of bookings** that agent made at that hotel, which link straight into the normal booking detail page from §5.

Use this to answer questions like "how much is each agent actually booking" or "which hotels does this agent work with most" without digging through the raw bookings list.

---

## 10. Settings (الإعدادات)

Shows your account info (name, email, role badge) and a live status check of whether the email-sending integration is configured — useful for confirming setup without exposing any actual key values.

---

## 11. A full example, start to finish

1. **Agent** gets a WhatsApp message from a client wanting a room at Hotel X. They open **إضافة حجز**, select Hotel X, type the guest's name and dates, click a room-rate chip, run the duplicate check (clean), review the cost, and save.
2. The booking now shows up for the whole team. The agent is auto-following it.
3. **Admin** sees it appear (or gets to it via the dashboard), opens the booking, and starts calling Hotel X to actually confirm availability and pricing — while doing that, they post a message in the chat: *"جاري التأكيد مع الفندق"* (confirming with the hotel).
4. Hotel X confirms. Admin changes the status dropdown from **قيد المراجعة** to **مؤكد** — a system message posts automatically announcing this, and the agent (who's following) gets a bell notification instantly.
5. Admin (or the agent) opens **استوديو البريد**, starts a new draft confirming the booking details back to the hotel, saves it, and sends it.
6. Later, anyone can open the booking and see the full story in one place: the original details, the cost breakdown, the chat conversation, the status-change history, and the sent email — nothing lives in someone's personal notes or a side spreadsheet.

---

## 12. Troubleshooting

- **"API key is invalid" / "You can only send testing emails to your own email address"** when sending — this is a Resend account configuration issue, not a bug in the app. It means either the email API key hasn't been set up yet, or a sending domain hasn't been verified yet. Ask whoever manages the project's environment configuration (see `README.md` §2) to fix it — this isn't something you can resolve from inside the app itself.
- **Can't see "الفريق" (Team) in the sidebar** — that's expected if you're an agent; it's admin-only by design (§9).
- **Can't add/edit a hotel** — same as above; ask an admin.
- **A booking you know about isn't showing up** — check you're not stuck on the "متابعاتي" (My follows) tab in the Bookings list; switch to "الكل" (All) to see everything.
