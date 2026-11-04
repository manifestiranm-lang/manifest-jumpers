"use strict";
/* Manifest — online skydiver registration. Plain JavaScript, no libraries.
   The fields, lists and rules follow the skydiver form of the Manifest desktop app. */
const $ = (id) => document.getElementById(id);
let L = "fa";
try { const s = localStorage.getItem("reg.lang"); if (s === "fa" || s === "en") L = s; } catch (e) { /* storage may be blocked */ }

/* ---------- digits and calendars ---------- */
const FAD = "۰۱۲۳۴۵۶۷۸۹", ARD = "٠١٢٣٤٥٦٧٨٩";
const toLatin = (s) => String(s == null ? "" : s).replace(/[۰-۹]/g, (d) => FAD.indexOf(d)).replace(/[٠-٩]/g, (d) => ARD.indexOf(d));
const toFa = (s) => String(s == null ? "" : s).replace(/\d/g, (d) => FAD[+d]);
const shown = (s) => (L === "fa" ? toFa(s) : String(s == null ? "" : s));
const idiv = (a, b) => Math.floor(a / b);
function j2g(jy, jm, jd) {
  jy += 1595; let days = -355668 + 365 * jy + idiv(jy, 33) * 8 + idiv((jy % 33) + 3, 4) + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * idiv(days, 146097); days %= 146097;
  if (days > 36524) { gy += 100 * idiv(--days, 36524); days %= 36524; if (days >= 365) days++; }
  gy += 4 * idiv(days, 1461); days %= 1461;
  if (days > 365) { gy += idiv(days - 1, 365); days = (days - 1) % 365; }
  let gd = days + 1; const sal = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0; for (gm = 0; gm < 13 && gd > sal[gm]; gm++) gd -= sal[gm];
  return [gy, gm, gd];
}
function g2j(gy, gm, gd) {
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]; const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 355666 + 365 * gy + idiv(gy2 + 3, 4) - idiv(gy2 + 99, 100) + idiv(gy2 + 399, 400) + gd + gdm[gm - 1];
  let jy = -1595 + 33 * idiv(days, 12053); days %= 12053; jy += 4 * idiv(days, 1461); days %= 1461;
  if (days > 365) { jy += idiv(days - 1, 365); days = (days - 1) % 365; }
  const jm = days < 186 ? 1 + idiv(days, 31) : 7 + idiv(days - 186, 30); const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}
const p2 = (n) => String(n).padStart(2, "0");
const jLen = (y, m) => { if (m <= 6) return 31; if (m <= 11) return 30; const g = j2g(y, 12, 30); const b = g2j(g[0], g[1], g[2]); return b[0] === y && b[1] === 12 && b[2] === 30 ? 30 : 29; };
const isoOf = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const TODAY = isoOf(new Date());
const shiftYears = (n) => { const d = new Date(); return `${d.getFullYear() + n}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; };
function fmtDate(iso) {
  if (!iso) return ""; const [y, m, d] = iso.split("-").map(Number);
  if (L === "fa") { const [a, b, c] = g2j(y, m, d); return toFa(`${a}/${p2(b)}/${p2(c)}`); }
  return `${y}/${p2(m)}/${p2(d)}`;
}
const JMONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const GMONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/* ---------- texts ---------- */
const LBL = {
  title: ["ثبت‌نام اسکای دایور", "Skydiver registration"], tag: ["همین‌جا ثبت‌نام کنید؛ بعد از بررسی، حساب شما فعال می‌شود", "Register here; your account is activated after a review"],
  intro: ["اطلاعات خود را کامل و دقیق وارد کنید. پس از ارسال، مسئول Manifest آن را بررسی می‌کند و در صورت تأیید، حساب شما فعال می‌شود. فیلدهای دارای ستاره لازم هستند.", "Fill in your details completely and accurately. After you send them, the Manifest staff reviews them and, if everything is fine, activates your account. Fields marked with * are required."],
  send: ["ارسال ثبت‌نام", "Send registration"], sending: ["در حال ارسال…", "Sending…"], uploading: ["در حال بارگذاری مدارک…", "Uploading documents…"],
  sec_account: ["حساب کاربری", "Account"], sec_personal: ["اطلاعات شخصی", "Personal details"], sec_emerg: ["تماس اضطراری", "Emergency contact"],
  sec_cat: ["دسته‌بندی", "Category"], sec_lic: ["لایسنس و عضویت", "License and membership"], sec_mem: ["عضویت", "Membership"], sec_qual: ["صلاحیت‌ها و رشته‌ها", "Ratings and disciplines"], sec_exp: ["سابقه‌ی پرش", "Jump experience"],
  sec_gear: ["تجهیزات", "Equipment"], sec_med: ["پزشکی و بیمه", "Medical and insurance"], sec_docs: ["عکس و مدارک", "Photo and documents"],
  nationalityType: ["تابعیت", "Nationality"], nationalId: ["کد ملی", "National ID"], passportNumber: ["شماره‌ی پاسپورت", "Passport number"], nationalityCountry: ["کشور / ملیت", "Country / Nationality"],
  userIs: ["نام کاربری شما:", "Your username:"], userHint: ["نام کاربری شما همان کد ملی (یا شماره‌ی پاسپورت) است.", "Your username is your national ID (or passport number)."],
  password: ["رمز ورود (دلخواه)", "Password (your choice)"], password2: ["تکرار رمز ورود", "Repeat password"], passHint: ["حداقل ۶ نویسه. هرکس رمز را خودش انتخاب می‌کند و هیچ‌کس نمی‌تواند آن را ببیند.", "At least 6 characters. You choose it yourself and nobody can read it."],
  firstFa: ["نام (فارسی)", "First name (Persian)"], lastFa: ["نام خانوادگی (فارسی)", "Last name (Persian)"], fatherFa: ["نام پدر (فارسی)", "Father's name (Persian)"],
  firstEn: ["نام (انگلیسی)", "First name (English)"], lastEn: ["نام خانوادگی (انگلیسی)", "Last name (English)"], fatherEn: ["نام پدر (انگلیسی)", "Father's name (English)"],
  birthDate: ["تاریخ تولد", "Date of birth"], age: ["سن (خودکار)", "Age (auto)"], gender: ["جنسیت", "Gender"], bloodType: ["گروه خونی", "Blood type"],
  phone: ["تلفن همراه", "Mobile phone"], email: ["ایمیل", "Email"], heightCm: ["قد (سانتی‌متر)", "Height (cm)"], weightKg: ["وزن (کیلوگرم)", "Weight (kg)"], bmi: ["BMI (خودکار)", "BMI (auto)"],
  emergencyNameFa: ["نام شخص (فارسی)", "Contact name (Persian)"], emergencyNameEn: ["نام شخص (انگلیسی)", "Contact name (English)"], emergencyPhone: ["تلفن شخص", "Contact phone"], emergencyRelation: ["نسبت", "Relationship"],
  skydiverCategory: ["شما کدام هستید؟", "Which are you?"], chooseCat: ["ابتدا دسته‌ی خود را انتخاب کنید تا بقیه‌ی فرم نمایش داده شود.", "Choose your category first; the rest of the form appears after that."],
  studentTraining: ["نوع آموزش", "Student training"], tandemPurpose: ["نوع شرکت در تندم", "Tandem participation"],
  organization: ["سازمان", "Organization"], organizationM: ["سازمان", "Organization"], licenseType: ["نوع لایسنس", "License type"], licenseNumber: ["شماره‌ی لایسنس", "License number"],
  membershipNumber: ["شماره‌ی عضویت", "Membership number"], membershipExpiry: ["انقضای عضویت", "Membership expiry"], extraLicenses: ["لایسنس‌های دیگر", "Other licenses"],
  authority: ["سازمان", "Organization"], number: ["شماره‌ی لایسنس", "License number"], addMore: ["+ افزودن لایسنس", "+ Add license"], remove: ["حذف", "Remove"],
  g_coach: ["صلاحیت‌ها و ریتینگ", "Qualifications and ratings"], g_inst: ["ریتینگ اینستراکتور", "Instructor ratings"], g_exam: ["ریتینگ اگزامینر", "Examiner ratings"], disciplines: ["رشته‌های پرش (همه‌ی موارد مرتبط)", "Jump disciplines (select all that apply)"],
  qualHint: ["موارد اعلام‌شده تا زمانی که مسئول تأیید نکند، فقط اظهار خود شماست.", "Declared ratings and disciplines are self-reported until verified by a qualified operator."], camHint: ["رشته‌ی فیلم‌بردار از ۱۰۰ پرش به بالا فعال می‌شود.", "Camera Flyer is available from 100 jumps."],
  lastJumpDate: ["تاریخ آخرین پرش", "Last jump date"], totalJumps: ["تعداد کل پرش‌ها", "Total jumps"], jumpsLast12Months: ["پرش‌های ۱۲ ماه گذشته", "Jumps in last 12 months"],
  expHint: ["از لاگ‌بوک تأییدشده وارد کنید. پرش‌های ۱۲ ماه نمی‌تواند از کل پرش‌ها بیشتر باشد.", "Use verified logbook totals. Jumps in the last 12 months cannot exceed lifetime jumps."],
  wsExp: ["تجربه‌ی پرش وینگ‌سوت", "Wingsuit jump experience"], totalWingsuitJumps: ["کل پرش‌های وینگ‌سوت", "Total wingsuit jumps"], currentWingsuitJumps: ["پرش با وینگ‌سوت فعلی", "Jumps on current wingsuit"],
  wsHint: ["ثبت تجربه‌ی وینگ‌سوت حداقل ۲۰۰ پرش لازم دارد.", "At least 200 lifetime jumps are required to record wingsuit experience."],
  isWingsuitPilot: ["خلبان وینگ‌سوت", "Wingsuit pilot"], wingsuitModel: ["مدل وینگ‌سوت فعلی", "Current wingsuit model"],
  rigOwnership: ["مالکیت تجهیزات", "Rig ownership"], own: ["شخصی", "Own"], rental: ["کرایه‌ای", "Rental"],
  rigType: ["مدل کانتینر", "Rig / container model"], mainModel: ["مدل کنوپی اصلی فعلی", "Current main canopy model"], mainSize: ["سایز کنوپی اصلی فعلی (فوت مربع)", "Current main size (sq ft)"],
  ownCanopyJumps: ["پرش با کنوپی اصلی فعلی", "Jumps on current main canopy"], reserveRepackDate: ["آخرین پک رزرو", "Last reserve repack"], repackDue: ["موعد پک رزرو (۱۸۰ روز بعد)", "Reserve repack due (+180 days)"],
  repackLate: ["پک رزرو از ۱۸۰ روز گذشته است.", "Reserve repack exceeds the 180-day reminder interval."],
  rentalLastCanopyModel: ["مدل آخرین کنوپی", "Last flown canopy model"], rentalLastCanopySize: ["سایز آخرین کنوپی (فوت مربع)", "Last flown canopy size (sq ft)"], rentalLastCanopyJumps: ["پرش با آخرین کنوپی", "Jumps on last flown canopy"],
  wl: ["بارگذاری بال تخمینی (lb/ft²)", "Estimated wing loading (lb/ft²)"], wlNeed: ["وزن و سایز کنوپی را وارد کنید", "Enter weight and canopy size"], wlMain: ["کنوپی اصلی فعلی · ۱۱ کیلو تجهیزات", "Current main · +11 kg gear"], wlRent: ["آخرین کنوپی · ۱۱ کیلو تجهیزات", "Last flown canopy · +11 kg gear"],
  wlInfo: ["فقط برای اطلاع؛ تصمیم دربارهٔ تأیید کنوپی نیست.", "Informational only, not a canopy-approval decision."],
  typeModel: ["نام مدل را بنویسید", "Type the model name"],
  medicalType: ["نوع گواهی پزشکی", "Medical type"], medicalExpiry: ["انقضای گواهی پزشکی", "Medical certificate expiry"], medicalNotes: ["یادداشت پزشکی (حداقلی)", "Medical notes (minimal)"],
  insuranceProvider: ["شرکت بیمه", "Insurance provider"], insurancePolicyNumber: ["شماره‌ی بیمه‌نامه", "Policy number"], insuranceExpiry: ["انقضای بیمه", "Insurance expiry"],
  f_photo: ["عکس پرسنلی", "Profile photo"], f_nationalId: ["کارت ملی", "National ID card"], f_passport: ["پاسپورت", "Passport"], f_license: ["عکس لایسنس / گواهینامه", "License / certificate photo"], f_logbook: ["آخرین صفحه‌ی لاگ‌بوک", "Logbook last page"],
  f_dataCard: ["عکس دیتا کارت ریگ", "Rig data card photo"], f_medical: ["عکس گواهی پزشکی", "Medical certificate photo"], f_insurance: ["عکس بیمه‌نامه", "Insurance policy photo"],
  n_medical: ["اختیاری", "Optional"], n_insurance: ["اختیاری", "Optional"],
  n_photo: ["الزامی", "Required"], n_nationalId: ["الزامی", "Required"], n_passport: ["الزامی", "Required"],
  n_license: ["الزامی اگر لایسنس دارید", "Required if you hold a license"], n_logbook: ["الزامی برای اسکای‌دایورها و هر کس سابقه‌ی پرش دارد", "Required for skydivers and anyone with jump history"],
  n_dataCard: ["اختیاری؛ بعد از هر ریپک رزرو، عکس جدید را بفرستید", "Optional; send a new photo after every reserve repack"],
  choose: ["انتخاب فایل", "Choose file"], noFile: ["فایلی انتخاب نشده", "No file chosen"], fileHint: ["عکس یا PDF، حداکثر ۵ مگابایت. اگر الان آماده نیست، بعداً هم می‌توانید به مسئول بدهید.", "Photo or PDF, up to 5 MB. If something is not ready now, you can hand it to the staff later."],
  select: ["انتخاب کنید...", "Select..."], other: ["سایر", "Other"], search: ["جستجو…", "Search…"], none: ["موردی پیدا نشد", "Nothing found"], today: ["امروز", "Today"], clear: ["پاک کردن", "Clear"], pickDate: ["انتخاب تاریخ", "Select date"],
  required: ["لازم است", "is required"], badDate: ["تاریخ درست نیست", "date is not valid"], badFile: ["فایل باید عکس یا PDF و حداکثر ۵ مگابایت باشد", "file must be a photo or PDF, up to 5 MB"],
  passShort: ["رمز باید حداقل ۶ نویسه باشد", "Password must be at least 6 characters"], passDiff: ["تکرار رمز با رمز یکی نیست", "Passwords do not match"], idBad: ["کد ملی باید ۱۰ رقم باشد (یا شماره‌ی پاسپورت درست نیست)", "National ID must be 10 digits (or the passport number is not valid)"],
  emailBad: ["ایمیل درست نیست (یا آن را خالی بگذارید)", "Email is not valid (or leave it empty)"], licE: ["لایسنس E فقط برای APF (استرالیا) است", "License E is only offered for APF (Australia)"],
  numBad: ["باید عدد صحیح و نامنفی باشد", "Enter a non-negative whole number"], cntLast: ["پرش‌های ۱۲ ماه نمی‌تواند از کل پرش‌ها بیشتر باشد", "Last 12 months cannot exceed total lifetime jumps"], cntTotal: ["اول کل پرش‌ها را وارد کنید", "Enter total lifetime jumps before the other jump counts"],
  cntWsTot: ["پرش‌های وینگ‌سوت نمی‌تواند از کل پرش‌ها بیشتر باشد", "Wingsuit jumps cannot exceed lifetime jumps"], cntWs200: ["تجربه‌ی وینگ‌سوت حداقل ۲۰۰ پرش لازم دارد", "Wingsuit experience requires at least 200 lifetime jumps"],
  cntWsFirst: ["اول کل پرش‌های وینگ‌سوت را وارد کنید", "Enter total wingsuit jumps first"], cntWsCur: ["پرش با وینگ‌سوت فعلی از کل وینگ‌سوت بیشتر نیست", "Jumps on current wingsuit cannot exceed total wingsuit jumps"],
  cntOwn: ["پرش با این کنوپی نمی‌تواند از کل پرش‌ها بیشتر باشد", "Jumps on this canopy cannot exceed total lifetime jumps"],
  dup: ["این کد ملی / شماره‌ی پاسپورت قبلاً ثبت‌نام شده است. اگر اشتباهی رخ داده، با مسئول Manifest تماس بگیرید.", "This national ID / passport number is already registered. If this is a mistake, contact the Manifest staff."],
  fail: ["ارسال انجام نشد. اینترنت را بررسی کنید و دوباره امتحان کنید.", "Could not send. Check your internet and try again."], failFiles: ["اطلاعات ثبت شد ولی بارگذاری بعضی مدارک انجام نشد. دوباره دکمه‌ی ارسال را بزنید.", "Your details were saved, but some documents did not upload. Press send again."],
  doneTitle: ["ثبت‌نام شما ارسال شد", "Your registration was sent"], doneText: ["اطلاعات شما برای بررسی ارسال شد. بعد از تأیید مسئول، حساب شما فعال می‌شود. این کد پیگیری را نگه دارید:", "Your details were sent for review. Your account is activated once the staff approves it. Keep this reference code:"], doneUser: ["نام کاربری شما:", "Your username:"], again: ["ثبت‌نام جدید", "New registration"],
};
const t = (k) => (LBL[k] ? LBL[k][L === "fa" ? 0 : 1] : k);

/* option lists: [value, fa, en] (the value is what the Manifest app stores) */
const O = (list) => list.map((x) => (Array.isArray(x) ? x : [x, x, x]));
const OPT = {
  gender: [["Male", "مرد", "Male"], ["Female", "زن", "Female"]],
  nationalityType: [["Iranian", "ایرانی", "Iranian"], ["Foreign", "خارجی", "Foreign"]],
  blood: O(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).concat([["Unknown", "نمی‌دانم", "I don't know"]]),
  category: [["Skydiver", "اسکای دایور", "Skydiver"], ["Student", "شاگرد", "Student"], ["Tandem Passenger", "مسافر تندم", "Tandem Passenger"]],
  training: [["AFF Student", "شاگرد AFF", "AFF Student"], ["Static Line Student", "شاگرد استاتیک‌لاین", "Static Line Student"], ["IAD Student", "شاگرد IAD", "IAD Student"], ["Solo Student", "شاگرد سولو", "Solo Student"]],
  tandem: [["Tandem Fun Jumper", "فان‌جامپر تندم", "Tandem Fun Jumper"], ["Tandem Student", "شاگرد تندم", "Tandem Student"]],
  org: [["USPA", "USPA", "USPA"], ["BPA", "BPA", "BPA"], ["FAI", "FAI", "FAI"], ["PASA (South Africa)", "PASA (آفریقای جنوبی)", "PASA (South Africa)"], ["CSPA (Canada)", "CSPA (کانادا)", "CSPA (Canada)"], ["APF (Australia)", "APF (استرالیا)", "APF (Australia)"],
    ["Iran Air Sports Federation", "انجمن ورزش‌های هوایی ایران", "Iran Air Sports Association"], ["Iran Civil Aviation Organization", "سازمان هواپیمایی کشوری ایران", "Iran Civil Aviation Organization"], ["Other", "سایر", "Other"]],
  medical: [["FAA Medical", "پزشکی FAA", "FAA Medical"], ["Iran CAO Medical", "پزشکی سازمان هواپیمایی کشوری", "Iran CAO Medical"], ["Medical Certificate", "گواهی پزشکی", "Medical Certificate"], ["Pre-Jump Medical Screening", "غربالگری پزشکی پیش از پرش", "Pre-Jump Medical Screening"], ["Self-Declaration", "اظهار شخصی", "Self-Declaration"], ["Other", "سایر", "Other"]],
  rel: [["Father", "پدر", "Father"], ["Mother", "مادر", "Mother"], ["Brother", "برادر", "Brother"], ["Sister", "خواهر", "Sister"], ["Wife", "همسر (زن)", "Wife"], ["Husband", "همسر (شوهر)", "Husband"], ["Friend", "دوست", "Friend"], ["Other", "سایر", "Other"]],
  rigs: [["Vector 3", "Vector 3", "Vector 3"], ["Javelin", "Javelin", "Javelin"], ["Icon A5", "Icon A5", "Icon A5"], ["Mirage", "Mirage", "Mirage"], ["Wings", "Wings", "Wings"], ["Infinity", "Infinity", "Infinity"], ["SWS", "SWS", "SWS"], ["Parachute de France", "Parachute de France", "Parachute de France"], ["ParAAvis", "ParAAvis", "ParAAvis"], ["Other", "سایر", "Other"]],
  disc: [["Belly", "بلی", "Belly"], ["Tracking", "ترکینگ", "Tracking"], ["Freefly", "فری‌فلای", "Freefly"], ["Wingsuit", "وینگ‌سوت", "Wingsuit"], ["Canopy Piloting", "کنوپی پایلوتینگ", "Canopy Piloting"], ["Canopy Formation", "کنوپی فرمیشن", "Canopy Formation"], ["Accuracy", "دقت", "Accuracy"], ["Camera Flyer", "فیلم‌بردار", "Camera Flyer"]],
  gCoach: [["coach", "کوچ", "Coach"], ["wingsuitCoach", "کوچ وینگ‌سوت", "Wingsuit Coach"], ["canopyCoach", "کوچ کنوپی", "Canopy Coach"], ["packer", "پکر", "Packer"], ["rigger", "ریگر", "Rigger"]],
  gInst: [["affInstructor", "AFF اینستراکتور", "AFF Instructor"], ["staticLineInstructor", "استاتیک‌لاین اینستراکتور", "Static Line Instructor"], ["iadInstructor", "IAD اینستراکتور", "IAD Instructor"], ["tandemInstructor", "تندم اینستراکتور", "Tandem Instructor"]],
  gExam: [["coachExaminer", "کوچ اگزامینر", "Coach Examiner"], ["affInstructorExaminer", "AFF اینستراکتور اگزامینر", "AFF Instructor Examiner"], ["staticLineInstructorExaminer", "استاتیک‌لاین اینستراکتور اگزامینر", "Static Line Instructor Examiner"], ["iadInstructorExaminer", "IAD اینستراکتور اگزامینر", "IAD Instructor Examiner"], ["tandemInstructorExaminer", "تندم اینستراکتور اگزامینر", "Tandem Instructor Examiner"]],
};
const IRAN_ORG = "Iran Air Sports Federation";
function licenseOpts() {
  const iranian = val("organization") === IRAN_ORG;
  const names = iranian ? { None: ["هیچ", "None"], A: ["مقدماتی", "Basic"], B: ["مبتدی", "Beginner"], C: ["متوسطه", "Intermediate"], D: ["پیشرفته", "Advanced"] } : { None: ["هیچ", "None"] };
  return ["None", "A", "B", "C", "D", "E"].filter((x) => x !== "E" || val("organization") === "APF (Australia)").map((x) => { const n = names[x]; return [x, n ? n[0] : x, n ? n[1] : x]; });
}
const ol = (arr, v) => { const r = arr.find((x) => x[0] === v); return r ? r[L === "fa" ? 1 : 2] : v; };
const canopyOpts = () => (window.REG_MODELS ? REG_MODELS.canopy : []).map((m) => [m, m, m, m.split(" — ")[0]]);
const wingsuitOpts = () => (window.REG_MODELS ? REG_MODELS.wingsuit : []).map((m) => [m, m, m, m.split(" — ")[0]]);

/* ---------- state ---------- */
const S = { v: { nationalityType: "Iranian", rigOwnership: "Rental", disciplines: [], ratings: {}, extraLicenses: [] }, files: {}, bad: new Set(), id: null, saved: false, other: {} };
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const val = (k) => (S.v[k] == null ? "" : S.v[k]);
const cat = () => val("skydiverCategory");
const NUMERIC = new Set(["heightCm", "weightKg", "totalJumps", "jumpsLast12Months", "totalWingsuitJumps", "currentWingsuitJumps", "ownCanopyJumps", "rentalLastCanopyJumps", "mainSize", "rentalLastCanopySize"]);
const DATEKEYS = new Set(["birthDate", "membershipExpiry", "lastJumpDate", "reserveRepackDate", "medicalExpiry", "insuranceExpiry"]);
const COUNT_KEYS = ["totalJumps", "jumpsLast12Months", "totalWingsuitJumps", "currentWingsuitJumps", "ownCanopyJumps", "rentalLastCanopyJumps"];
function dateRange(k) { // [min, max] ISO
  switch (k) {
    case "birthDate": return [shiftYears(-100), TODAY];
    case "lastJumpDate": return [shiftYears(-70), TODAY];
    case "reserveRepackDate": return [shiftYears(-5), TODAY];
    default: return [shiftYears(-5), shiftYears(15)];
  }
}

/* ---------- controls ---------- */
const DD = {}; // dropdown definitions for the current render
const vis = (o) => (o && o.vis ? ` data-vis="${o.vis}"` : "");
function IN(k, o) {
  o = o || {}; const bad = S.bad.has(k) ? " bad" : ""; const m = o.m || (NUMERIC.has(k) ? "int" : "");
  const v = m || (k !== "email" && !/^password/.test(k)) ? shown(val(k)) : val(k);
  return `<label class="f${o.full ? " full" : ""}"${vis(o)}><span class="l${o.req ? " req" : ""}">${t(o.label || k)}</span><input type="${o.type || "text"}" data-k="${k}" data-m="${m}" class="${(o.ltr || m ? "ltr" : "") + bad}"${m ? ' inputmode="numeric"' : ""} value="${esc(v)}" autocomplete="${o.ac || "off"}"><small class="fe" id="fe-${k}"></small>${o.hint ? `<small class="hint">${t(o.hint)}</small>` : ""}</label>`;
}
function TA(k, o) { return `<label class="f full"><span class="l">${t(k)}</span><textarea data-k="${k}">${esc(val(k))}</textarea></label>`; }
function DDC(k, o) {
  DD[k] = { opts: o.opts, search: !!o.search, other: !!o.other, group: !!o.group };
  const cur = val(k); const isOther = o.other && (S.other[k] || (cur && !o.opts.some((x) => x[0] === cur)));
  const lab = isOther ? t("other") : (cur ? ol(o.opts, cur) : "");
  return `<div class="f${o.full ? " full" : ""}"${vis(o)}><span class="l${o.req ? " req" : ""}">${t(o.label || k)}</span><button type="button" class="dd-btn${S.bad.has(k) ? " bad" : ""}" data-dd="${k}"><span class="v${lab ? "" : " ph"}">${esc(lab || t("select"))}</span><i class="chev"></i></button>${isOther ? `<input type="text" class="ltr" data-k="${k}" data-m="" style="margin-top:8px" placeholder="${t("typeModel")}" value="${esc(cur)}">` : ""}<small class="fe" id="fe-${k}"></small></div>`;
}
function DATE(k, o) {
  o = o || {}; const txt = fmtDate(val(k));
  return `<div class="f"${vis(o)}><span class="l${o.req ? " req" : ""}">${t(k)}</span><button type="button" class="dd-btn${S.bad.has(k) ? " bad" : ""}" data-date="${k}"><span class="v${txt ? " dt" : " ph"}">${esc(txt || t("pickDate"))}</span><span class="cal-ic">📅</span></button><small class="fe" id="fe-${k}"></small></div>`;
}
const SEG = (k, opts) => `<div class="seg" role="group">${opts.map((x) => `<button type="button" class="${val(k) === x[0] ? "on" : ""}" data-seg="${k}" data-v="${esc(x[0])}">${esc(x[L === "fa" ? 1 : 2])}</button>`).join("")}</div>`;
const CHIPS = (name, opts) => `<div class="chips">${opts.map((x) => { const on = name === "rating" ? !!S.v.ratings[x[0]] : S.v.disciplines.includes(x[0]); return `<label class="chip${on ? " on" : ""}"><input type="checkbox" data-chip="${name}" data-v="${esc(x[0])}"${on ? " checked" : ""}>${esc(x[L === "fa" ? 1 : 2])}</label>`; }).join("")}</div>`;
const SEC = (ic, title, body) => `<section class="sec"><h2><span class="ic">${ic}</span>${t(title)}</h2>${body}</section>`;
const RO = (id, lab) => `<div class="ro-wrap" id="w-${id}"><span class="l" style="font-size:13.5px;color:#d5ddcb;display:block;margin-bottom:5px">${t(lab)}</span><div class="ro" id="ro-${id}"><strong>—</strong></div><small id="rs-${id}"></small></div>`;
function FILE(kind) { const f = S.files[kind]; return `<div class="file-row${f ? " has" : ""}" data-fr="${kind}"><div class="nm"><b>${t("f_" + kind)}</b> <small class="fnote">${t("n_" + kind)}</small><br><span class="fn">${f ? esc(f.name) : t("noFile")}</span></div><label class="btn" style="margin:0">${t("choose")}<input type="file" data-file="${kind}" accept="image/jpeg,image/png,image/webp,application/pdf" style="display:none"></label></div>`; }

function docKinds() { const c = cat(); return ["photo", val("nationalityType") === "Iranian" ? "nationalId" : "passport"].concat(c === "Skydiver" ? ["license"] : [], c === "Tandem Passenger" ? [] : ["logbook"], c !== "Tandem Passenger" && val("rigOwnership") === "Own" ? ["dataCard"] : [], ["medical", "insurance"]); }
function render() {
  for (const k of Object.keys(DD)) delete DD[k];
  document.documentElement.lang = L; document.documentElement.dir = L === "fa" ? "rtl" : "ltr"; document.title = "Manifest — " + t("title");
  document.querySelectorAll(".lang button").forEach((b) => b.classList.toggle("on", b.dataset.l === L));
  $("title").textContent = t("title"); $("tag").textContent = t("tag"); $("intro").textContent = t("intro"); $("send").textContent = t("send");
  const iran = val("nationalityType") === "Iranian", c = cat();
  let h = "";
  h += SEC("🔐", "sec_account", `<span class="l" style="display:block;font-size:13.5px;color:#d5ddcb;margin-bottom:6px">${t("nationalityType")}</span>${SEG("nationalityType", OPT.nationalityType)}<div class="grid">${iran ? IN("nationalId", { req: 1, ltr: 1, m: "id" }) : IN("passportNumber", { req: 1, ltr: 1, m: "upper" }) + IN("nationalityCountry", { req: 1 })}</div>
    <div class="userbox">${t("userIs")} <b id="ub">—</b><small class="hint" style="margin:0">${t("userHint")}</small></div>
    <div class="grid">${IN("password", { req: 1, type: "password", ltr: 1, ac: "new-password", m: "" })}${IN("password2", { req: 1, type: "password", ltr: 1, ac: "new-password", m: "" })}</div><small class="hint" style="margin:-6px 0 12px">${t("passHint")}</small>`);
  h += SEC("👤", "sec_personal", `<div class="grid">${IN("firstFa", { req: 1 })}${IN("lastFa", { req: 1 })}${IN("fatherFa", { req: 1 })}${IN("firstEn", { req: 1, ltr: 1 })}${IN("lastEn", { req: 1, ltr: 1 })}${IN("fatherEn", { req: 1, ltr: 1 })}
    ${DDC("gender", { req: 1, opts: OPT.gender })}${DATE("birthDate", { req: 1 })}${RO("age", "age")}${DDC("bloodType", { req: 1, opts: OPT.blood })}
    ${IN("phone", { req: 1, type: "tel", ltr: 1, m: "tel", ac: "tel" })}${IN("email", { type: "email", ltr: 1, ac: "email", m: "" })}${IN("heightCm", { req: 1 })}${IN("weightKg", { req: 1 })}${RO("bmi", "bmi")}</div>`);
  h += SEC("🚨", "sec_emerg", `<div class="grid">${IN("emergencyNameFa", { req: 1 })}${IN("emergencyNameEn", { req: 1, ltr: 1 })}${IN("emergencyPhone", { req: 1, type: "tel", ltr: 1, m: "tel" })}${DDC("emergencyRelation", { req: 1, opts: OPT.rel })}</div>`);
  h += SEC("🎯", "sec_cat", `<span class="l req" style="display:block;font-size:13.5px;color:#d5ddcb;margin-bottom:6px">${t("skydiverCategory")}</span>${SEG("skydiverCategory", OPT.category)}${c ? "" : `<small class="hint" style="margin:-6px 0 12px">${t("chooseCat")}</small>`}${c === "Student" ? `<div class="grid">${DDC("studentTraining", { req: 1, opts: OPT.training })}</div>` : ""}${c === "Tandem Passenger" ? `<div class="grid">${DDC("tandemPurpose", { req: 1, opts: OPT.tandem })}</div>` : ""}`);
  if (c && c !== "Tandem Passenger") {
    let lic = `<div class="grid">${DDC("organization", { label: c === "Skydiver" ? "organization" : "organizationM", opts: OPT.org })}${IN("membershipNumber", { ltr: 1 })}${DATE("membershipExpiry", {})}</div>`;
    if (c === "Skydiver") {
      const ext = S.v.extraLicenses.map((e, i) => `<div class="row2"><div class="f" style="margin:0"><span class="l">${t("authority")}</span><button type="button" class="dd-btn" data-ext-dd="${i}"><span class="v">${esc(ol(OPT.org, e.authority))}</span><i class="chev"></i></button></div><label class="f" style="margin:0"><span class="l">${t("number")}</span><input type="text" data-ext="${i}" data-f="number" class="ltr" value="${esc(e.number)}"></label><button type="button" class="btn" data-rm="${i}">${t("remove")}</button></div>`).join("");
      lic += `<span class="sub-t">${t("licenseType")}</span><div class="grid">${DDC("licenseType", { opts: licenseOpts() })}${IN("licenseNumber", { ltr: 1 })}</div><span class="sub-t">${t("extraLicenses")}</span>${ext}${S.v.extraLicenses.length < 5 ? `<button type="button" class="btn" id="addExt" style="margin:4px 0 14px">${t("addMore")}</button>` : ""}`;
    }
    h += SEC("🪪", c === "Skydiver" ? "sec_lic" : "sec_mem", lic);
  }
  if (c === "Skydiver") h += SEC("🏅", "sec_qual", `<span class="sub-t">${t("g_coach")}</span>${CHIPS("rating", OPT.gCoach)}<span class="sub-t">${t("g_inst")}</span>${CHIPS("rating", OPT.gInst)}<span class="sub-t">${t("g_exam")}</span>${CHIPS("rating", OPT.gExam)}<span class="sub-t">${t("disciplines")}</span>${CHIPS("disc", OPT.disc)}<small class="hint" style="margin:-6px 0 12px">${t("camHint")} ${t("qualHint")}</small>`);
  if (c && c !== "Tandem Passenger") {
    h += SEC("📈", "sec_exp", `<div class="grid">${DATE("lastJumpDate", {})}${IN("totalJumps", {})}${IN("jumpsLast12Months", {})}</div><small class="hint" style="margin:-6px 0 14px">${t("expHint")}</small>
      ${c === "Skydiver" ? `<div data-vis="ws"><span class="sub-t">${t("wsExp")}</span><div class="grid">${IN("totalWingsuitJumps", {})}${IN("currentWingsuitJumps", {})}</div><small class="hint" style="margin:-6px 0 14px">${t("wsHint")}</small></div>` : ""}`);
    const own = val("rigOwnership") === "Own";
    h += SEC("🪂", "sec_gear", `${SEG("rigOwnership", [["Own", t("own"), t("own")], ["Rental", t("rental"), t("rental")]])}
      ${own ? `<div class="grid">${DDC("rigType", { opts: OPT.rigs })}${DDC("mainModel", { opts: canopyOpts(), group: 1, search: 1, other: 1 })}${IN("mainSize", { m: "dec", ltr: 1 })}${IN("ownCanopyJumps", {})}${DATE("reserveRepackDate", {})}${RO("due", "repackDue")}</div>`
      : `<div class="grid">${DDC("rentalLastCanopyModel", { opts: canopyOpts(), group: 1, search: 1, other: 1 })}${IN("rentalLastCanopySize", { m: "dec", ltr: 1 })}${IN("rentalLastCanopyJumps", {})}</div>`}
      ${RO("wl", "wl")}
      ${c === "Skydiver" ? `<div class="chips"><label class="chip" id="pilotChip"><input type="checkbox" data-bool="isWingsuitPilot">${t("isWingsuitPilot")}</label></div>
      <div class="grid" data-vis="ws">${DDC("wingsuitModel", { opts: wingsuitOpts(), group: 1, search: 1, other: 1 })}</div>` : ""}`);
  }
  if (c) {
    h += SEC("🩺", "sec_med", `<div class="grid">${DDC("medicalType", { opts: OPT.medical })}${DATE("medicalExpiry", {})}${IN("medicalNotes", {})}${IN("insuranceProvider", {})}${IN("insurancePolicyNumber", { ltr: 1 })}${DATE("insuranceExpiry", {})}</div>`);
    const kinds = docKinds();
    h += SEC("📎", "sec_docs", `<span class="hint" style="margin:0 0 10px;display:block">${t("fileHint")}</span><div class="file-grid">${kinds.map(FILE).join("")}</div>`);
  }
  $("fields").innerHTML = h;
  refreshDyn();
}
function rerender() { const y = window.scrollY; closePop(); render(); window.scrollTo(0, y); }

/* ---------- live values: age, BMI, wing loading, errors ---------- */
const num = (k) => { const s = toLatin(val(k)).trim(); if (s === "") return null; return /^\d+$/.test(s) ? Number(s) : NaN; };
function countErrors() {
  const E = {}; const sky = cat() === "Skydiver"; const total = num("totalJumps"), last = num("jumpsLast12Months"), wt = sky ? num("totalWingsuitJumps") : null, cur = sky ? num("currentWingsuitJumps") : null;
  const own = val("rigOwnership") === "Own" ? num("ownCanopyJumps") : null, rent = val("rigOwnership") === "Rental" ? num("rentalLastCanopyJumps") : null;
  for (const k of COUNT_KEYS) if (Number.isNaN(num(k)) && (sky || !/Wingsuit/.test(k))) E[k] = "numBad";
  if (total === null && [last, wt, cur, own, rent].some((n) => n !== null && n > 0)) E.totalJumps = "cntTotal";
  if (total !== null && last !== null && last > total) E.jumpsLast12Months = "cntLast";
  if (total !== null && wt > 0 && wt > total) E.totalWingsuitJumps = "cntWsTot";
  if (total !== null && cur > 0 && cur > total) E.currentWingsuitJumps = "cntWsTot";
  if (total !== null && own > total) E.ownCanopyJumps = "cntOwn";
  if (total !== null && rent > total) E.rentalLastCanopyJumps = "cntOwn";
  if (sky && (S.v.isWingsuitPilot || wt > 0 || cur > 0)) {
    if (wt > 0 && (total === null || total < 200)) E.totalWingsuitJumps = "cntWs200";
    if (cur > 0 && (total === null || total < 200)) E.currentWingsuitJumps = "cntWs200";
    if (wt === null && cur > 0 && !E.currentWingsuitJumps) E.totalWingsuitJumps = "cntWsFirst";
  }
  if (wt !== null && cur !== null && cur > wt && !E.currentWingsuitJumps) E.currentWingsuitJumps = "cntWsCur";
  return E;
}
const TIERS = [[50, 1.10, 190, "1–50"], [100, 1.29, 160, "51–100"], [500, 1.49, 139, "101–500"], [1000, 2.00, 119, "501–1000"], [1500, 2.40, 99, "1001–1500"], [Infinity, 3.00, 68, "1500+"]];
function setRO(id, text, level, sub, danger) {
  const ro = $("ro-" + id); if (!ro) return; ro.className = "ro" + (level ? " " + level : ""); ro.firstElementChild.textContent = text;
  const s = $("rs-" + id); if (s) s.textContent = sub || ""; const w = $("w-" + id); if (w) w.classList.toggle("danger", !!danger);
}
function refreshDyn() {
  const ub = $("ub"); if (ub) ub.textContent = shown(username()) || "—";
  // age
  if ($("ro-age")) { const b = val("birthDate"); let age = ""; if (b) { const [y, m, d] = b.split("-").map(Number); const n = new Date(); age = n.getFullYear() - y - ((n.getMonth() + 1 < m || (n.getMonth() + 1 === m && n.getDate() < d)) ? 1 : 0); } setRO("age", age === "" ? "—" : shown(age), ""); }
  // BMI
  const hc = num("heightCm"), wk = num("weightKg");
  if ($("ro-bmi")) { if (hc > 0 && wk > 0) { const b = wk / ((hc / 100) ** 2); const lv = b >= 18.5 && b < 25 ? "ok" : ((b >= 17 && b < 18.5) || (b >= 25 && b < 30)) ? "warn" : "bad"; setRO("bmi", shown(b.toFixed(1)), lv); } else setRO("bmi", "—", ""); }
  // reserve repack due
  if ($("ro-due")) { const r = val("reserveRepackDate"); if (r) { const d = new Date(r + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + 180); const due = d.toISOString().slice(0, 10); const late = due < TODAY; setRO("due", fmtDate(due), late ? "bad" : "ok", late ? t("repackLate") : "", late); } else setRO("due", "—", ""); }
  // wing loading
  if ($("ro-wl")) {
    const own = val("rigOwnership") === "Own"; const area = Number(toLatin(val(own ? "mainSize" : "rentalLastCanopySize")).trim());
    if (!(wk > 0) || !(area > 0)) setRO("wl", "—", "", t("wlNeed"));
    else { const loading = (wk + 11) * 2.20462262185 / area; const total = num("totalJumps"); let lv = "", sub = t(own ? "wlMain" : "wlRent");
      if (total !== null && !Number.isNaN(total)) { const tier = TIERS.find((x) => total <= x[0]) || TIERS[TIERS.length - 1]; const ok = loading <= tier[1] + 0.004 && area >= tier[2]; lv = ok ? "ok" : "bad"; sub += ` · ${shown(tier[3])} ${L === "fa" ? "پرش" : "jumps"}: ${L === "fa" ? "حداکثر" : "max"} ${shown(tier[1].toFixed(2))} lb/ft², ${L === "fa" ? "کنوپی حداقل" : "canopy ≥"} ${shown(tier[2])} ft²`; }
      setRO("wl", shown(loading.toFixed(2)), lv, sub + " · " + t("wlInfo")); }
  }
  // inline errors
  const E = countErrors();
  for (const k of COUNT_KEYS) { const fe = $("fe-" + k); if (fe) { fe.textContent = E[k] ? t(E[k]) : ""; fe.classList.toggle("on", !!E[k]); const inp = document.querySelector(`[data-k="${k}"]`); if (inp) inp.classList.toggle("bad", !!E[k]); } }
  // camera flyer (needs 100+ jumps), wingsuit parts (200+ jumps / pilot)
  const total = num("totalJumps"); const camOk = total !== null && !Number.isNaN(total) && total >= 100;
  if (!camOk) { const i = S.v.disciplines.indexOf("Camera Flyer"); if (i >= 0) S.v.disciplines.splice(i, 1); }
  document.querySelectorAll('[data-chip="disc"][data-v="Camera Flyer"]').forEach((el) => { el.disabled = !camOk; el.checked = S.v.disciplines.includes("Camera Flyer"); const chip = el.closest(".chip"); chip.classList.toggle("off", !camOk); chip.classList.toggle("on", el.checked); });
  const pilot = !!S.v.isWingsuitPilot;
  document.querySelectorAll('[data-vis="ws"]').forEach((el) => { el.hidden = !pilot || cat() !== "Skydiver"; });
  document.querySelectorAll('[data-bool="isWingsuitPilot"]').forEach((el) => { el.checked = pilot; el.closest(".chip").classList.toggle("on", pilot); });
}
function username() { return toLatin(val("nationalityType") === "Iranian" ? val("nationalId") : val("passportNumber")).trim(); }

/* ---------- pop-up (dropdowns and calendar) ---------- */
const POP = $("pop"), SCRIM = $("scrim"); let P = null;
const isSheet = () => window.innerWidth <= 700;
function placePop() {
  if (!P || POP.classList.contains("sheet")) return;
  const r = P.anchor.getBoundingClientRect(); if (P.kind === "dd") POP.style.width = Math.max(r.width, 240) + "px";
  const w = POP.offsetWidth, h = POP.offsetHeight; let top = r.bottom + 6;
  if (top + h > innerHeight - 8) top = (r.top - h - 6 > 8) ? r.top - h - 6 : Math.max(8, innerHeight - h - 8);
  let left = document.documentElement.dir === "rtl" ? r.right - w : r.left; left = Math.min(Math.max(8, left), innerWidth - w - 8);
  POP.style.top = top + "px"; POP.style.left = left + "px";
}
function showPop(anchor, kind, cls, html, state) {
  closePop(); P = Object.assign({ anchor, kind }, state); POP.className = "pop " + cls; POP.innerHTML = html; POP.dir = document.documentElement.dir; POP.style.width = "";
  const sec = anchor.closest(".sec"); POP.style.setProperty("--pc", sec ? getComputedStyle(sec).getPropertyValue("--c") : "#f28c28");
  POP.hidden = false; const sheet = isSheet(); POP.classList.toggle("sheet", sheet); SCRIM.hidden = !sheet; anchor.classList.add("open"); placePop();
}
function closePop() { if (P) P.anchor.classList.remove("open"); P = null; POP.hidden = true; SCRIM.hidden = true; POP.innerHTML = ""; }
document.addEventListener("pointerdown", (e) => { if (P && !POP.contains(e.target) && !P.anchor.contains(e.target)) closePop(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePop(); });
window.addEventListener("scroll", placePop, true); let lastW = innerWidth; window.addEventListener("resize", () => { if (P && innerWidth !== lastW) closePop(); lastW = innerWidth; });

function ddList(def, q, cur) {
  let items = def.opts; const needle = (q || "").trim().toLowerCase();
  if (needle) items = items.filter((x) => `${x[1]} ${x[2]} ${x[0]}`.toLowerCase().includes(needle));
  let h = "", last = null;
  for (const x of items) {
    if (def.group && x[3] !== last) { last = x[3]; h += `<div class="grp">${esc(last)}</div>`; }
    const show = def.group ? x[0].split(" — ").slice(1).join(" — ") : x[L === "fa" ? 1 : 2];
    h += `<button type="button" class="opt${cur === x[0] ? " on" : ""}" data-pick="${esc(x[0])}">${esc(show)}</button>`;
  }
  if (def.other && !needle) h += `<button type="button" class="opt${S.other[P.k] ? " on" : ""}" data-pick="__other">${t("other")}</button>`;
  if (!items.length && !(def.other && !needle)) h += `<div class="none">${t("none")}</div>`;
  return h;
}
function openDD(btn, k, ext) {
  const def = ext !== undefined ? { opts: OPT.org, search: false, other: false, group: false } : DD[k]; if (!def) return;
  const cur = ext !== undefined ? S.v.extraLicenses[ext].authority : val(k);
  showPop(btn, "dd", "dd", `${def.search ? `<div class="srch"><input type="text" data-q placeholder="${t("search")}" autocomplete="off"></div>` : ""}<div class="lst"></div>`, { k, ext, def, cur });
  POP.querySelector(".lst").innerHTML = ddList(def, "", cur); placePop();
  const sel = POP.querySelector(".opt.on"); if (sel) sel.scrollIntoView({ block: "nearest" });
  const q = POP.querySelector("[data-q]"); if (q && !isSheet()) q.focus();
}
function setBtnLabel(sel, text, ph) { const b = document.querySelector(sel); if (!b) return; const v = b.querySelector(".v"); v.textContent = text; v.classList.toggle("ph", !!ph); if (b.dataset.date) v.classList.toggle("dt", !ph); }
function pickDD(v) {
  const { k, ext, def } = P;
  if (ext !== undefined) { S.v.extraLicenses[ext].authority = v; closePop(); setBtnLabel(`[data-ext-dd="${ext}"]`, ol(OPT.org, v)); return; }
  const wasOther = !!S.other[k] || (def.other && val(k) && !def.opts.some((x) => x[0] === val(k)));
  if (v === "__other") { S.other[k] = true; S.v[k] = ""; } else { S.other[k] = false; S.v[k] = v; }
  S.bad.delete(k); closePop();
  if (k === "organization" && val("licenseType") && !licenseOpts().some((x) => x[0] === val("licenseType"))) S.v.licenseType = "";
  if (k === "organization" || def.other || wasOther) { rerender(); return; }
  setBtnLabel(`[data-dd="${k}"]`, ol(def.opts, v)); const b = document.querySelector(`[data-dd="${k}"]`); if (b) b.classList.remove("bad"); refreshDyn();
}

/* calendar */
const WEEK_J = ["ش", "ی", "د", "س", "چ", "پ", "ج"], WEEK_G = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const calParts = (iso) => { const [y, m, d] = iso.split("-").map(Number); return L === "fa" ? g2j(y, m, d) : [y, m, d]; };
const calIso = (y, m, d) => { if (L === "fa") { const g = j2g(y, m, d); return `${g[0]}-${p2(g[1])}-${p2(g[2])}`; } return `${y}-${p2(m)}-${p2(d)}`; };
function openCal(btn, k) {
  const [minI, maxI] = dateRange(k); let base = val(k) || (k === "birthDate" ? shiftYears(-25) : TODAY); if (base < minI) base = minI; if (base > maxI) base = maxI;
  const [vy, vm] = calParts(base); showPop(btn, "cal", "cal", "", { k, mode: "days", vy, vm, minI, maxI }); drawCal();
}
function drawCal() {
  const { k, mode, vy, vm, minI, maxI } = P; const fa = L === "fa"; const pd = (n) => (fa ? toFa(n) : String(n)); const MN = fa ? JMONTHS : GMONTHS; const cur = val(k);
  const rtl = document.documentElement.dir === "rtl"; const [y0] = calParts(minI), [y1] = calParts(maxI);
  let h = "";
  if (mode === "days") {
    const len = fa ? jLen(vy, vm) : new Date(Date.UTC(vy, vm, 0)).getUTCDate(); const dow = new Date(calIso(vy, vm, 1) + "T00:00:00Z").getUTCDay(); const lead = fa ? (dow + 1) % 7 : dow;
    h += `<div class="cal-head"><button type="button" class="cal-nav" data-nav="-1" aria-label="prev">${rtl ? "›" : "‹"}</button><button type="button" class="cal-title" data-ym>${MN[vm - 1]} ${pd(vy)} ▾</button><button type="button" class="cal-nav" data-nav="1" aria-label="next">${rtl ? "‹" : "›"}</button></div>`;
    h += `<div class="cal-grid wk">${(fa ? WEEK_J : WEEK_G).map((w) => `<span>${w}</span>`).join("")}</div><div class="cal-grid">`;
    for (let i = 0; i < lead; i++) h += "<span></span>";
    for (let d = 1; d <= len; d++) { const iso = calIso(vy, vm, d); const dis = iso < minI || iso > maxI; h += `<button type="button" data-day="${iso}" class="${dis ? "dis" : ""}${iso === cur ? " sel" : ""}${iso === TODAY ? " today" : ""}"${dis ? " disabled" : ""}>${pd(d)}</button>`; }
    h += `</div>`;
  } else {
    h += `<div class="cal-head"><button type="button" class="cal-title" data-ym>${MN[vm - 1]} ${pd(vy)} ▴</button></div><div class="cal-ym"><div class="months">${MN.map((n, i) => `<button type="button" data-m="${i + 1}" class="${i + 1 === vm ? "sel" : ""}">${n}</button>`).join("")}</div><div class="years">${Array.from({ length: y1 - y0 + 1 }, (_, i) => y0 + i).map((y) => `<button type="button" data-y="${y}" class="${y === vy ? "sel" : ""}">${pd(y)}</button>`).join("")}</div></div>`;
  }
  h += `<div class="cal-foot"><button type="button" data-clr>${t("clear")}</button><button type="button" data-today${TODAY < minI || TODAY > maxI ? " disabled" : ""}>${t("today")}</button></div>`;
  POP.innerHTML = h; placePop();
  if (mode === "ym") { const s = POP.querySelector(".years .sel"); if (s) s.scrollIntoView({ block: "center" }); }
}
function setDate(k, iso) { if (iso) S.v[k] = iso; else delete S.v[k]; S.bad.delete(k); const txt = fmtDate(iso); setBtnLabel(`[data-date="${k}"]`, txt || t("pickDate"), !txt); const b = document.querySelector(`[data-date="${k}"]`); if (b) b.classList.remove("bad"); closePop(); refreshDyn(); }
POP.addEventListener("click", (e) => {
  const el = e.target.closest("button"); if (!el || !P) return;
  if (P.kind === "dd" && el.dataset.pick !== undefined) return pickDD(el.dataset.pick);
  if (P.kind !== "cal") return;
  if (el.dataset.day) return setDate(P.k, el.dataset.day);
  if (el.dataset.clr !== undefined) return setDate(P.k, "");
  if (el.dataset.today !== undefined) return setDate(P.k, TODAY);
  if (el.dataset.ym !== undefined) { P.mode = P.mode === "days" ? "ym" : "days"; return drawCal(); }
  if (el.dataset.nav) { let m = P.vm + Number(el.dataset.nav), y = P.vy; if (m > 12) { m = 1; y++; } if (m < 1) { m = 12; y--; } P.vy = y; P.vm = m; return drawCal(); }
  if (el.dataset.m) { P.vm = Number(el.dataset.m); P.mode = "days"; return drawCal(); }
  if (el.dataset.y) { P.vy = Number(el.dataset.y); return drawCal(); }
});
POP.addEventListener("input", (e) => { if (e.target.matches("[data-q]") && P && P.kind === "dd") { POP.querySelector(".lst").innerHTML = ddList(P.def, e.target.value, P.cur); placePop(); } });

/* ---------- events ---------- */
function setErr(msg) { const e = $("err"); e.textContent = msg || ""; e.style.display = msg ? "block" : "none"; if (msg) e.scrollIntoView({ block: "center", behavior: "smooth" }); }
const fields = $("fields");
fields.addEventListener("input", (ev) => {
  const el = ev.target; const k = el.dataset.k;
  if (el.dataset.ext !== undefined) { S.v.extraLicenses[+el.dataset.ext][el.dataset.f] = el.value; return; }
  if (!k) return;
  let v = el.value; const m = el.dataset.m;
  if (m === "int") v = toLatin(v).replace(/\D/g, ""); else if (m === "dec") v = toLatin(v).replace(/[^\d.]/g, ""); else if (m === "id") v = toLatin(v).replace(/\D/g, "").slice(0, 10); else if (m === "tel") v = toLatin(v).replace(/[^\d+]/g, ""); else if (m === "upper") v = toLatin(v).toUpperCase();
  if (m && m !== "upper") el.value = shown(v); else if (m === "upper") el.value = v;
  else if (k !== "email" && !/^password/.test(k) && L === "fa") { const lat = toLatin(v); v = lat; const shownV = shown(lat); if (el.value !== shownV) { const pos = el.selectionStart; el.value = shownV; try { el.setSelectionRange(pos, pos); } catch (_) {} } }
  S.v[k] = v; S.bad.delete(k); el.classList.remove("bad");
  if (k === "totalJumps" && /^\d+$/.test(v)) S.v.isWingsuitPilot = Number(v) >= 200;
  refreshDyn();
});
fields.addEventListener("change", (ev) => {
  const el = ev.target;
  if (el.dataset.file) { const f = el.files && el.files[0]; if (f) { S.files[el.dataset.file] = f; const row = document.querySelector(`[data-fr="${el.dataset.file}"]`); if (row) { row.classList.add("has"); row.querySelector(".fn").textContent = f.name; } } return; }
  if (el.dataset.chip) { const v = el.dataset.v; if (el.dataset.chip === "rating") { if (el.checked) S.v.ratings[v] = true; else delete S.v.ratings[v]; } else { const a = S.v.disciplines; const i = a.indexOf(v); if (el.checked && i < 0) a.push(v); if (!el.checked && i >= 0) a.splice(i, 1); } el.closest(".chip").classList.toggle("on", el.checked); return; }
  if (el.dataset.bool) { S.v[el.dataset.bool] = el.checked; refreshDyn(); }
});
fields.addEventListener("click", (ev) => {
  const b = ev.target.closest("button"); if (!b) return;
  if (b.dataset.seg) { S.v[b.dataset.seg] = b.dataset.v; rerender(); return; }
  if (b.dataset.dd) { if (P && P.anchor === b) closePop(); else openDD(b, b.dataset.dd); return; }
  if (b.dataset.extDd !== undefined) { if (P && P.anchor === b) closePop(); else openDD(b, "ext", Number(b.dataset.extDd)); return; }
  if (b.dataset.date) { if (P && P.anchor === b) closePop(); else openCal(b, b.dataset.date); return; }
  if (b.id === "addExt") { S.v.extraLicenses.push({ authority: "USPA", number: "" }); rerender(); return; }
  if (b.dataset.rm !== undefined) { S.v.extraLicenses.splice(+b.dataset.rm, 1); rerender(); }
});
document.querySelectorAll(".lang button").forEach((b) => b.addEventListener("click", () => {
  L = b.dataset.l; try { localStorage.setItem("reg.lang", L); } catch (e) { /* ignore */ } rerender();
}));
// small ripple on clicks
document.addEventListener("pointerdown", (e) => {
  const host = e.target.closest(".seg button, .btn, .submit, .chip, .dd-btn, .lang button, .pop .opt"); if (!host || host.disabled) return;
  const r = host.getBoundingClientRect(); const size = Math.max(r.width, r.height); const s = document.createElement("span"); s.className = "rip";
  s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`; host.appendChild(s); setTimeout(() => s.remove(), 650);
});
setTimeout(() => { $("fields").classList.remove("fx"); }, 1500);

/* ---------- validate and send ---------- */
const MAXB = 5 * 1024 * 1024, MIMES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const cfg = () => window.REG_CONFIG;
const hdr = (x) => Object.assign({ apikey: cfg().key, Authorization: "Bearer " + cfg().key }, x || {});
function validate() {
  const P_ = []; S.bad = new Set(); const need = (k) => { if (!String(val(k)).trim()) { P_.push(`${t(k)}: ${t("required")}`); S.bad.add(k); } };
  const iran = val("nationalityType") === "Iranian", c = cat();
  need(iran ? "nationalId" : "passportNumber"); if (!iran) need("nationalityCountry");
  const u = username(); if (u && (iran ? !/^\d{10}$/.test(u) : (u.length < 5 || u.length > 30))) { P_.push(t("idBad")); S.bad.add(iran ? "nationalId" : "passportNumber"); }
  if ((val("password") || "").length < 6) { P_.push(t("passShort")); S.bad.add("password"); }
  if (val("password") !== val("password2")) { P_.push(t("passDiff")); S.bad.add("password2"); }
  ["firstFa", "lastFa", "fatherFa", "firstEn", "lastEn", "fatherEn", "gender", "bloodType", "birthDate", "phone", "heightCm", "weightKg", "emergencyNameFa", "emergencyNameEn", "emergencyPhone", "emergencyRelation"].forEach(need);
  if (val("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val("email")).trim())) { P_.push(`${t("email")}: ${t("emailBad")}`); S.bad.add("email"); }
  if (!c) { P_.push(`${t("skydiverCategory")}: ${t("required")}`); } else {
    if (c === "Student") need("studentTraining"); if (c === "Tandem Passenger") need("tandemPurpose");
    if (c === "Skydiver" && val("licenseType") === "E" && val("organization") !== "APF (Australia)") { P_.push(t("licE")); S.bad.add("licenseType"); }
  }
  const hc = num("heightCm"), wk = num("weightKg");
  if (hc !== null && !(hc >= 50 && hc <= 260)) { P_.push(`${t("heightCm")}: 50 – 260`); S.bad.add("heightCm"); }
  if (wk !== null && !(wk >= 15 && wk <= 300)) { P_.push(`${t("weightKg")}: 15 – 300`); S.bad.add("weightKg"); }
  if (c && c !== "Tandem Passenger") { const E = countErrors(); for (const [k, m] of Object.entries(E)) { P_.push(`${t(k)}: ${t(m)}`); S.bad.add(k); } }
  { const kinds = docKinds(), total = num("totalJumps"), sky = c === "Skydiver";
    const must = ["photo", iran ? "nationalId" : "passport"];
    if (sky && String(val("licenseNumber") || "").trim()) must.push("license");
    if (c && c !== "Tandem Passenger" && (sky || (total !== null && total > 0))) must.push("logbook");
    for (const k of must) if (kinds.includes(k) && !S.files[k]) P_.push(`${t("f_" + k)}: ${t("required")}`); }
  for (const kind of Object.keys(S.files).filter((k) => docKinds().includes(k))) { const f = S.files[kind]; if (!MIMES.includes(f.type) || f.size > MAXB) P_.push(`${t("f_" + kind)}: ${t("badFile")}`); }
  return P_;
}
function buildData() {
  const c = cat(), d = {}; const SIZEKEYS = /^(phone|emergencyPhone|nationalId|passportNumber|mainSize|rentalLastCanopySize)$/;
  const put = (k) => { let v = S.v[k]; if (v === "" || v == null) return; if (typeof v === "string") { v = SIZEKEYS.test(k) ? toLatin(v).trim() : v.trim(); if (v === "") return; if (NUMERIC.has(k) && !SIZEKEYS.test(k)) v = Number(toLatin(v)); } d[k] = v; };
  ["nationalityType", "firstFa", "lastFa", "fatherFa", "firstEn", "lastEn", "fatherEn", "gender", "birthDate", "bloodType", "phone", "email", "heightCm", "weightKg", "emergencyNameFa", "emergencyNameEn", "emergencyPhone", "emergencyRelation", "skydiverCategory", "medicalType", "medicalExpiry", "medicalNotes", "insuranceProvider", "insurancePolicyNumber", "insuranceExpiry"].forEach(put);
  if (val("nationalityType") === "Iranian") put("nationalId"); else { put("passportNumber"); put("nationalityCountry"); }
  if (c === "Student") put("studentTraining"); if (c === "Tandem Passenger") put("tandemPurpose");
  if (c !== "Tandem Passenger") {
    ["organization", "membershipNumber", "membershipExpiry", "lastJumpDate", "totalJumps", "jumpsLast12Months", "rigOwnership"].forEach(put);
    if (val("rigOwnership") === "Own") ["rigType", "mainModel", "mainSize", "ownCanopyJumps", "reserveRepackDate"].forEach(put); else ["rentalLastCanopyModel", "rentalLastCanopySize", "rentalLastCanopyJumps"].forEach(put);
    if (c === "Skydiver") { d.isWingsuitPilot = !!S.v.isWingsuitPilot; if (d.isWingsuitPilot) ["wingsuitModel", "totalWingsuitJumps", "currentWingsuitJumps"].forEach(put); }
  }
  if (c === "Skydiver") {
    ["licenseType", "licenseNumber"].forEach(put); d.disciplines = S.v.disciplines.slice(); d.ratings = Object.assign({}, S.v.ratings);
    d.extraLicenses = S.v.extraLicenses.filter((e) => e.number.trim()).map((e) => ({ authority: e.authority, number: e.number.trim() }));
  }
  return d;
}
const safeName = (n) => String(n).replace(/[^A-Za-z0-9._-]/g, "_").slice(-60) || "file";
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => { const r = (Math.random() * 16) | 0; return (c === "x" ? r : (r & 3) | 8).toString(16); }));

$("form").addEventListener("submit", async (ev) => {
  ev.preventDefault(); setErr("");
  const hp = ev.target.elements.website; if (hp && hp.value) return; // bot trap
  const problems = validate();
  if (problems.length) { document.querySelectorAll(".bad").forEach((e) => e.classList.remove("bad")); S.bad.forEach((k) => document.querySelectorAll(`[data-k="${k}"],[data-dd="${k}"],[data-date="${k}"]`).forEach((e) => e.classList.add("bad"))); setErr(problems.join("\n")); return; }
  const btn = $("send"); btn.disabled = true; btn.textContent = t("sending");
  try {
    const data = buildData(); if (!S.id) S.id = newId();
    const metas = Object.entries(S.files).filter(([k]) => docKinds().includes(k)).map(([kind, f]) => ({ kind, path: `${S.id}/${kind}-${safeName(f.name)}`, mime: f.type, name: f.name, size: f.size }));
    if (!S.saved) {
      const r = await fetch(`${cfg().url}/rest/v1/rpc/submit_registration`, { method: "POST", headers: hdr({ "Content-Type": "application/json" }), body: JSON.stringify({ p_id: S.id, p_lang: L, p_data: data, p_files: metas, p_password: val("password") }) });
      if (!r.ok) { let m = ""; try { m = (await r.json()).message || ""; } catch (e) { /* ignore */ } if (/duplicate_username/.test(m)) { S.id = null; setErr(t("dup")); btn.disabled = false; btn.textContent = t("send"); return; } throw new Error("save " + r.status + " " + m); }
      S.saved = true;
    }
    btn.textContent = t("uploading");
    let failed = 0;
    for (const m of metas) {
      const f = S.files[m.kind];
      const r = await fetch(`${cfg().url}/storage/v1/object/registration-docs/${m.path}`, { method: "POST", headers: hdr({ "Content-Type": m.mime, "x-upsert": "true" }), body: f });
      if (!r.ok) failed++;
    }
    if (failed) { setErr(t("failFiles")); btn.disabled = false; btn.textContent = t("send"); return; }
    $("form").style.display = "none"; const d = $("done"); d.style.display = "block";
    d.innerHTML = `<div style="font-size:48px">🪂</div><h2>${t("doneTitle")}</h2><p>${t("doneText")}</p><div class="ref">${S.id.slice(0, 8).toUpperCase()}</div><p class="sub">${t("doneUser")} <b dir="ltr">${esc(shown(username()))}</b></p><button class="submit" type="button" id="again" style="max-width:320px">${t("again")}</button>`;
    $("again").addEventListener("click", () => location.reload());
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) { console.error(e); setErr(t("fail")); btn.disabled = false; btn.textContent = t("send"); }
});
render();
