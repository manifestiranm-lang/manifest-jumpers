/* Manifest — skydiver portal (installable web app). All data goes through secure database functions; the phone only holds a login token. */
(function () {
  "use strict";
  var CFG = window.REG_CONFIG;
  var $app = document.getElementById("app");
  var VAPID = "BEX0-dBPiLfKJY0OfSjTi7OH2_0dLM6mti1VtiP8U0Pq20RvYALIJqGH9QoH_ymInGDPtV0EBrjIbs2_4ei0W9w";
  var LSK = { lang: "mj_lang", sess: "mj_session", notes: "mj_notes", prev: "mj_prev", fired: "mj_fired", seenMsg: "mj_seen_msg", tab: "mj_tab" };
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }

  function loadSess() { try { var v = localStorage.getItem("mj_session") || sessionStorage.getItem("mj_session"); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function saveSess(sess, remember) { try { localStorage.removeItem("mj_session"); sessionStorage.removeItem("mj_session"); (remember ? localStorage : sessionStorage).setItem("mj_session", JSON.stringify(sess)); } catch (e) { /* storage blocked */ } }
  var L = lsGet(LSK.lang, "fa") === "en" ? "en" : "fa";
  var S = { sess: loadSess(), tab: "loads", view: "", me: null, loads: null, msgs: [], dm: [], peers: [], peer: "", pq: "", anim: true, popAfter: 0, notes: lsGet(LSK.notes, []), photo: "", busy: false, err: "", toast: "", loadedAt: 0, expanded: {}, grp: [], gm: {}, pres: {}, pgs: "", rep: null, selmode: false, ss: {}, menu: 0, fw: null, cq: "", lq: "", sr: false, sidx: 0, gnew: null, gadd: null, gi: false, dlg: null, nm: false, stick: false, noscroll: false };

  /* ---------- texts ---------- */
  var TX = {
    app: ["Manifest", "Manifest"], chat_title: ["منیفست", "Manifest"], dm_title: ["گفتگوها", "Chats"], p_slot: ["اسلات", "Slot"], p_name: ["نام", "Name"], p_det: ["جزئیات", "Details"], p_empty: ["اسلات خالی", "Empty slots"], p_cap: ["ظرفیت", "Capacity"], p_ac: ["هواپیما", "Aircraft"], p_pur: ["نوع لود", "Load type"], reg_acct: ["ساخت حساب کاربری", "Create an account"], reg_q: ["حساب کاربری ندارید؟", "Don't have an account?"], sos_btn_t: ["درخواست کمک اضطراری", "Emergency help"], sos_sub: ["ارسال موقعیت مکانی برای مسئولان منیفست", "Send your location to Manifest staff"], blood_need: ["برای تغییر گروه خونی، عکس یا PDF آزمایش خون را هم بفرستید.", "To change your blood type, also attach a photo or PDF of the blood test."], blood_file: ["آزمایش خون (عکس یا PDF)", "Blood test (photo or PDF)"], blood_hint: ["برای تغییر گروه خونی لازم است.", "Required to change blood type."], blood_pick: ["انتخاب فایل", "Choose file"], blood_big: ["فایل باید عکس یا PDF و کمتر از ۵ مگابایت باشد.", "File must be a photo or PDF under 5 MB."], dm_new: ["گفتگوی تازه", "New chat"], dm_search: ["جستجوی نام جامپر…", "Search a jumper…"], dm_none: ["جامپری پیدا نشد.", "No jumpers found."], dm_sub: ["با دیگر جامپرها گفتگو کنید", "Chat with other jumpers"], dm_empty: ["هنوز گفتگویی با جامپرها ندارید.", "No jumper chats yet."], dm_hello: ["هنوز پیامی نیست. سلام کنید!", "No messages yet. Say hi!"], back: ["بازگشت", "Back"], chat_sub: ["پیام، عکس، فایل و پیام صوتی بفرستید", "Send messages, photos, files and voice"], today: ["امروز", "Today"], yesterday: ["دیروز", "Yesterday"], rec_no: ["این مرورگر ضبط صدا را پشتیبانی نمی‌کند.", "This browser cannot record audio."], rec_deny: ["دسترسی به میکروفن داده نشد.", "Microphone access was denied."], big15: ["حجم فایل نباید بیشتر از ۱۵ مگابایت باشد.", "The file must be 15 MB or smaller."], badtype: ["این نوع فایل پشتیبانی نمی‌شود.", "This file type is not supported."], del_msg: ["حذف پیام", "Delete message"], sys_sos: ["SOS ارسال شد", "SOS sent"], sys_edit: ["درخواست ویرایش اطلاعات ارسال شد", "Profile edit request sent"], sys_reset: ["درخواست رمز جدید ارسال شد", "Password reset request sent"], voice_lbl: ["پیام صوتی", "Voice message"], photo_lbl: ["عکس", "Photo"], sub: ["پنل اسکای‌دایور", "Skydiver portal"],
    user: ["نام کاربری (کد ملی یا شماره پاسپورت)", "Username (national ID or passport number)"], pass: ["رمز ورود", "Password"],
    login: ["ورود", "Sign in"], reg: ["ثبت‌نام ندارید؟ ثبت‌نام", "No account? Register"], logout: ["خروج", "Sign out"],
    bad_login: ["نام کاربری یا رمز درست نیست.", "Wrong username or password."], locked: ["تلاش‌های زیاد. ۱۵ دقیقه دیگر دوباره امتحان کنید.", "Too many tries. Try again in 15 minutes."],
    pending: ["ثبت‌نام شما هنوز تأیید نشده است. بعد از تأیید مسئول می‌توانید وارد شوید.", "Your registration is not approved yet. You can sign in after the staff approves it."],
    net: ["اتصال اینترنت مشکل دارد.", "Network problem."], fill: ["نام کاربری و رمز را وارد کنید.", "Enter username and password."],
    t_loads: ["لودها", "Loads"], t_alerts: ["اعلان‌ها", "Alerts"], t_set: ["تنظیمات", "Settings"], t_msgs: ["پیام‌ها", "Messages"], t_me: ["پروفایل", "Profile"],
    loads_none: ["فعلاً لودی ثبت نشده است.", "No loads yet."], loads_mine: ["لودهای من", "My loads"], loads_all: ["همهٔ لودها", "All loads"],
    today: ["امروز", "Today"], upd: ["آخرین به‌روزرسانی", "Last update"], load: ["لود", "Load"], onload: ["شما در این لود هستید", "You are on this load"],
    seats: ["نفر", "people"], names: ["فهرست نفرات", "Manifest list"], none_on: ["هنوز کسی ثبت نشده", "Nobody yet"], leaves: ["تا پرواز", "to takeoff"],
    st: { "Open": ["باز", "Open"], "Loading": ["در حال بارگیری", "Loading"], "Ready": ["آماده", "Ready"], "Preparation Complete": ["آماده‌سازی کامل", "Prep complete"], "Boarding": ["سوارشدن", "Boarding"], "Hold": ["توقف", "On hold"], "Completed": ["انجام‌شده", "Completed"], "Cancelled": ["لغو شد", "Cancelled"] },
    alerts_none: ["اعلانی ندارید.", "No alerts."], enable_n: ["فعال‌کردن اعلان روی گوشی", "Enable phone notifications"], n_on: ["اعلان‌ها روی این دستگاه فعال است.", "Notifications are on for this device."], clear: ["پاک‌کردن", "Clear"],
    msg_ph: ["پیام خود را بنویسید…", "Write a message…"], send: ["ارسال", "Send"], msg_none: ["هنوز پیامی نیست. هر سؤال یا درخواستی دارید بنویسید.", "No messages yet. Write any question or request."], staff: ["مسئول", "Staff"],
    me_nf: ["اطلاعات شما هنوز به سامانه نرسیده است. کمی بعد دوباره امتحان کنید.", "Your profile has not reached the system yet. Try again shortly."],
    f_profile: ["مشخصات", "Profile"], f_cred: ["مدارک و عضویت", "License & membership"], f_rig: ["تجهیزات", "Equipment"], f_med: ["پزشکی و بیمه", "Medical & insurance"], f_emg: ["تماس اضطراری", "Emergency contact"], f_docs: ["مدارک من", "My documents"],
    back: ["بازگشت", "Back"],
    remember: ["مرا به خاطر بسپار", "Remember me"], forgot: ["رمز را فراموش کرده‌اید؟", "Forgot password?"], f_pw: ["تغییر رمز", "Change password"],
    forgot_phone: ["شمارهٔ موبایلی که هنگام ثبت‌نام وارد کرده‌اید", "Mobile number you used when registering"], forgot_bad: ["اطلاعات با ثبت‌نام شما نمی‌خواند.", "These details do not match your registration."],
    code_h: ["رمز موقت شما", "Your temporary password"], code_note: ["با همین رمز وارد شوید؛ بعد از ورود باید رمز جدید انتخاب کنید. تا آن موقع رمز قبلی شما هم کار می‌کند. این رمز ۲۴ ساعت اعتبار دارد.", "Sign in with it, then you will choose a new password. Until then your old password still works. It is valid for 24 hours."],
    must_h: ["لطفاً رمز جدید خود را انتخاب کنید", "Please choose your new password"], locked2: ["تلاش‌های زیاد. بعداً دوباره امتحان کنید.", "Too many attempts. Try again later."],
    forgot_t: ["بازیابی رمز", "Password recovery"], forgot_h: ["نام کاربری و شمارهٔ موبایل ثبت‌نامتان را وارد کنید تا رمز موقت بگیرید.", "Enter your username and registered mobile number to get a temporary password."],
    forgot_ok: ["درخواست ارسال شد. مسئول رمز جدید را به شما اطلاع می‌دهد.", "Request sent. The staff will give you a new password."], send_req: ["ارسال درخواست", "Send request"], to_login: ["بازگشت به ورود", "Back to sign in"],
    pw_old: ["رمز فعلی", "Current password"], pw_new: ["رمز جدید (حداقل ۶ حرف)", "New password (min. 6 characters)"], pw_new2: ["تکرار رمز جدید", "Repeat new password"], pw_save: ["ذخیره رمز", "Save password"],
    pw_done: ["رمز شما تغییر کرد.", "Your password was changed."], pw_short: ["رمز جدید باید حداقل ۶ حرف باشد.", "New password must be at least 6 characters."], pw_mismatch: ["دو رمز جدید یکسان نیستند.", "The new passwords do not match."], pw_bad: ["رمز فعلی درست نیست.", "Current password is wrong."],
    k_first: ["نام", "First name"], k_last: ["نام خانوادگی", "Last name"], k_father: ["نام پدر", "Father's name"], k_birth: ["تاریخ تولد", "Date of birth"], k_blood: ["گروه خونی", "Blood type"], k_gender: ["جنسیت", "Gender"],
    k_nat: ["ملیت", "Nationality"], k_id: ["کد ملی / پاسپورت", "National ID / passport"], k_phone: ["تلفن", "Phone"], k_email: ["ایمیل", "Email"], k_h: ["قد (سانتی‌متر)", "Height (cm)"], k_w: ["وزن (کیلوگرم)", "Weight (kg)"],
    k_org: ["سازمان", "Organization"], k_ltype: ["نوع لایسنس", "License type"], k_lno: ["شمارهٔ لایسنس", "License number"], k_mem: ["شمارهٔ عضویت", "Membership number"], k_memx: ["انقضای عضویت", "Membership expiry"],
    k_rigown: ["مالکیت ریگ", "Rig ownership"], k_rigtype: ["نوع ریگ", "Rig"], k_main: ["کنوپی اصلی", "Main canopy"], k_repack: ["آخرین ریپک رزرو", "Last reserve repack"], k_repackdue: ["موعد ریپک بعدی", "Next repack due"],
    k_medtype: ["نوع گواهی پزشکی", "Medical type"], k_medx: ["انقضای پزشکی", "Medical expiry"], k_inprov: ["شرکت بیمه", "Insurance provider"], k_inno: ["شمارهٔ بیمه‌نامه", "Policy number"], k_inx: ["انقضای بیمه", "Insurance expiry"],
    k_ename: ["نام تماس اضطراری", "Contact name"], k_ephone: ["تلفن اضطراری", "Contact phone"], k_erel: ["نسبت", "Relationship"], k_jumps: ["کل پرش‌ها", "Total jumps"], k_first_jump: ["اولین پرش", "First jump"],
    d_photo: ["عکس پرسنلی", "Personal photo"], d_nid: ["کارت ملی", "National ID card"], d_pass: ["پاسپورت", "Passport"], d_lic: ["عکس لایسنس", "License photo"], d_log: ["آخرین صفحهٔ لاگ‌بوک", "Last logbook page"], d_card: ["دیتا کارت ریگ", "Rig data card"], d_med: ["گواهی پزشکی", "Medical certificate"], d_ins: ["بیمه‌نامه", "Insurance policy"],
    opt: ["اختیاری", "optional"], req: ["الزامی", "required"], ok: ["ثبت‌شده", "On file"], miss: ["ثبت نشده", "Missing"], upload: ["ارسال عکس/فایل", "Upload photo/file"], uploaded: ["ارسال شد؛ منتظر بررسی مسئول", "Sent; waiting for staff"],
    big: ["فایل باید عکس یا PDF و حداکثر ۵ مگابایت باشد.", "File must be a photo or PDF, up to 5 MB."], doc_hint: ["فایل شما برای مسئول ارسال می‌شود و بعد از بررسی به پروندهٔ شما اضافه می‌شود.", "Your file goes to the staff and is added to your record after review."],
    n_add: ["شما به لود {n} اضافه شدید.", "You were added to Load {n}."], n_rem: ["شما از لود {n} حذف شدید.", "You were removed from Load {n}."], n_call: ["{m} دقیقه تا پرواز لود {n}.", "{m} minutes to takeoff — Load {n}."],
    n_board: ["لود {n}: سوارشدن شروع شد.", "Load {n}: boarding."], n_hold: ["لود {n} متوقف شد.", "Load {n} is on hold."], n_msg: ["پیام جدید از منیفست.", "New message from Manifest."], n_dm: ["پیام جدید از یک جامپر.", "New message from a jumper."],
    n_exp: ["{what} تا {d} روز دیگر منقضی می‌شود.", "{what} expires in {d} days."], n_expd: ["{what} منقضی شده است.", "{what} has expired."],
    w_mem: ["عضویت", "Membership"], w_med: ["گواهی پزشکی", "Medical certificate"], w_ins: ["بیمه", "Insurance"], w_rep: ["ریپک رزرو", "Reserve repack"],
    sent_ok: ["ارسال شد.", "Sent."], fail: ["خطا. دوباره امتحان کنید.", "Something went wrong. Try again."], yes: ["بله", "Yes"], no: ["خیر", "No"], own: ["شخصی", "Own"], rental: ["اجاره‌ای", "Rental"]
  };
  Object.assign(TX, {
    f_cred: ["لایسنس و عضویت", "Licenses & membership"], f_docs: ["مدارک من", "My documents"], f_log: ["لاگ‌بوک", "Logbook"],
    d_nid: ["عکس کارت ملی", "National ID photo"], d_pass: ["عکس پاسپورت", "Passport photo"], d_lic: ["عکس لایسنس", "License photo"], d_log: ["عکس آخرین صفحهٔ لاگ‌بوک", "Last logbook page photo"], d_card: ["عکس دیتا کارت ریگ", "Rig data card photo"],
    d_med: ["عکس مدیکال پزشکی", "Medical certificate photo"], d_ins: ["عکس بیمه‌نامه", "Insurance policy photo"], d_blood: ["آزمایش خون (عکس یا PDF)", "Blood test (photo or PDF)"], d_rig: ["عکس کامل ریگ", "Full rig photo"], d_can: ["عکس کنوپی", "Canopy photo"],
    n_blood: ["برای مواقع اضطراری به این مدرک نیاز داریم تا گروه خونی شما مشخص و قابل استناد باشد.", "We need this for emergencies, so your blood group is documented and can be relied on."],
    n_rig: ["اختیاری؛ برای پیگیری تجهیزات در صورت گم‌شدن یا دیده‌شدن نزد شخص دیگر.", "Optional; helps trace your equipment if it is lost or found with someone else."],
    n_can: ["اختیاری؛ برای پیگیری کنوپی در صورت گم‌شدن یا دیده‌شدن نزد شخص دیگر.", "Optional; helps trace your canopy if it is lost or found with someone else."],
    g_type: ["نوع هواپیما", "Aircraft type"], g_serial: ["شمارهٔ سریال", "Serial no."], g_alt: ["ارتفاع (ft)", "Altitude (ft)"], g_seats: ["نفرات", "People"], g_free: ["ظرفیت خالی", "Free seats"], g_pur: ["نوع لود", "Load type"], g_lic: ["لایسنس", "License"], g_jt: ["نوع پرش", "Jump type"], you: ["شما", "you"],
    names: ["فهرست نفرات", "Jumper list"],
    wx_t: ["وضعیت جوی", "Weather"], wx_temp: ["دما", "Temperature"], wx_wind: ["باد", "Wind"], wx_gust: ["تندباد", "Gusts"], wx_dir: ["جهت باد", "Direction"], wx_cloud: ["ابر", "Cloud"], wx_vis: ["دید", "Visibility"], wx_hum: ["رطوبت", "Humidity"], wx_dew: ["نقطهٔ شبنم", "Dew point"], wx_pres: ["فشار", "Pressure"], wx_base: ["ارتفاع پایهٔ ابر", "Cloud base"], wx_low: ["ابر پایین", "Low cloud"], wx_mid: ["ابر میانی", "Mid cloud"], wx_high: ["ابر بالا", "High cloud"], wx_feels: ["احساس‌شده", "Feels like"], wx_rain: ["بارش", "Rain"], wx_now: ["اکنون", "Now"], wx_note: ["اطلاعات تقریبی است و جای تصمیم مسئول پرواز را نمی‌گیرد", "Approximate; it does not replace the jump operations decision"],
    sos_text: ["با زدن «ارسال»، موقعیت مکانی شما برای مسئولان Manifest فرستاده می‌شود. اگر مشکلی پیش آمده یا بیرون از محل فرود نشسته‌اید (آف‌لندینگ)، از این موقعیت برای پیدا کردن شما استفاده می‌شود. فقط در شرایط واقعی بزنید.", "When you press Send, your location is sent to the Manifest staff. If something went wrong or you landed away from the drop zone (off-landing), they will use it to find you. Use it only in a real situation."],
    sos_send: ["ارسال موقعیت SOS", "Send SOS location"], sos_done: ["SOS برای مسئولان ارسال شد. در صورت امکان تلفن همراهتان را کنار خود نگه دارید.", "SOS was sent to the staff. Keep your phone with you if possible."], sos_nopos: ["موقعیت مکانی در دسترس نبود؛ لطفاً دسترسی موقعیت را برای مرورگر روشن کنید.", "Location was not available; please allow location access for your browser."], cancel: ["انصراف", "Cancel"], close: ["بستن", "Close"],
    edit: ["ویرایش", "Edit"], review: ["بررسی تغییرات", "Review changes"], rev_h: ["تغییرات شما را تأیید می‌کنید؟", "Do you confirm your changes?"], rev_note: ["بعد از تأیید، تغییرات برای مسئول ارسال می‌شود و پس از اعمال در پرونده به شما خبر داده می‌شود.", "After you confirm, the changes go to the staff and you are notified once they are applied to your record."], confirm_send: ["تأیید و ارسال", "Confirm & send"], edit_sent: ["تغییرات برای مسئول ارسال شد.", "Your changes were sent to the staff."], no_change: ["تغییری ایجاد نکرده‌اید.", "You have not changed anything."],
    k_first_fa: ["نام (فارسی)", "First name (Persian)"], k_last_fa: ["نام خانوادگی (فارسی)", "Last name (Persian)"], k_father_fa: ["نام پدر (فارسی)", "Father's name (Persian)"], k_first_en: ["نام (انگلیسی)", "First name (English)"], k_last_en: ["نام خانوادگی (انگلیسی)", "Last name (English)"], k_father_en: ["نام پدر (انگلیسی)", "Father's name (English)"], k_ename_fa: ["نام تماس اضطراری (فارسی)", "Contact name (Persian)"], k_ename_en: ["نام تماس اضطراری (انگلیسی)", "Contact name (English)"],
    k_xlic: ["لایسنس‌های دیگر", "Other licenses"], add_lic: ["افزودن لایسنس", "Add license"], k_mainm: ["مدل کنوپی اصلی", "Main canopy model"], k_mains: ["سایز کنوپی اصلی", "Main canopy size"],
    lic_main: ["لایسنس اصلی", "Main license"], lic_n: ["لایسنس", "License"], mem_h: ["عضویت", "Membership"],
    log_none: ["هنوز پرشی در لاگ‌بوک شما ثبت نشده است.", "No jumps in your logbook yet."], log_total: ["تعداد پرش‌های ثبت‌شده", "Recorded jumps"], log_date: ["تاریخ", "Date"], log_load: ["لود", "Load"], log_ac: ["هواپیما", "Aircraft"], log_type: ["نوع پرش", "Type"], log_alt: ["ارتفاع", "Alt"]
  });
  Object.assign(TX, {
    s_lang: ["زبان", "Language"], s_notif: ["اعلان‌ها", "Notifications"], s_bg: ["تصاویر پس‌زمینه", "Background images"], s_on: ["روشن", "On"], s_off: ["خاموش", "Off"],
    s_acct: ["حساب کاربری", "Account"], s_app: ["دربارهٔ برنامه", "About the app"], s_ver: ["نسخهٔ وب‌اپ", "Web app version"], s_install: ["برای نصب: در مرورگر گزینهٔ «افزودن به صفحهٔ اصلی» را بزنید.", "To install: use “Add to Home screen” in your browser."], s_user: ["نام کاربری", "Username"],
    log_stats: ["آمار لاگ‌بوک", "Logbook statistics"], ls_base: ["پرش‌های قبل از ثبت در Manifest", "Before Manifest"], ls_rec: ["ثبت‌شده در Manifest", "Recorded in Manifest"], ls_jumps: ["پرش", "jumps"], ls_total: ["کل پرش‌ها", "Total jumps"], ls_year: ["پرش‌های امسال", "This year"], ls_last: ["آخرین پرش", "Last jump"], ls_max: ["بیشترین ارتفاع", "Max altitude"], ls_types: ["بر اساس نوع پرش", "By jump type"], ls_ago: ["{d} روز پیش", "{d} days ago"],
    rd_h: ["وضعیت مدارک", "Readiness"], rd_left: ["{d} روز مانده", "{d} days left"], rd_exp: ["منقضی شده", "Expired"], rd_none: ["ثبت نشده", "Not set"], rd_rep: ["ریپک رزرو (موعد بعدی)", "Reserve repack (next due)"],
    pickDate: ["انتخاب تاریخ", "Pick a date"], cal_clear: ["پاک کردن", "Clear"], p_jt: ["نوع", "Type"], dp_d: ["روز", "Day"], dp_m: ["ماه", "Month"], dp_y: ["سال", "Year"], close: ["بستن", "Close"]
  });
  function tx(k) { var v = TX[k]; return v ? v[L === "fa" ? 0 : 1] : k; }
  function fmt(s, o) { return String(s).replace(/\{(\w+)\}/g, function (_, k) { return o[k] === undefined ? "" : o[k]; }); }
  var FAD = "۰۱۲۳۴۵۶۷۸۹";
  function D(v) { v = v === null || v === undefined ? "" : String(v).replace(/[۰-۹]/g, function (d) { return FAD.indexOf(d); }).replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }); return L === "fa" ? v.replace(/\d/g, function (d) { return FAD[+d]; }) : v; }
  function esc(s) { return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- dates ---------- */
  function g2j(gy, gm, gd) { var gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]; var gy2 = gm > 2 ? gy + 1 : gy; var days = 355666 + 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + gdm[gm - 1]; var jy = -1595 + 33 * Math.floor(days / 12053); days %= 12053; jy += 4 * Math.floor(days / 1461); days %= 1461; if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; } var jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30); var jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30); return [jy, jm, jd]; }
  function j2g(jy, jm, jd) { jy += 1595; var days = -355668 + 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + jd + (jm < 7 ? (jm - 1) * 31 : ((jm - 7) * 30) + 186); var gy = 400 * Math.floor(days / 146097); days %= 146097; if (days > 36524) { gy += 100 * Math.floor(--days / 36524); days %= 36524; if (days >= 365) days++; } gy += 4 * Math.floor(days / 1461); days %= 1461; if (days > 365) { gy += Math.floor((days - 1) / 365); days = (days - 1) % 365; } var gd = days + 1; var sal = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; var gm; for (gm = 0; gm < 13 && gd > sal[gm]; gm++) gd -= sal[gm]; return [gy, gm, gd]; }
  var JM = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function dateTxt(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ""); if (!m) return iso ? D(iso) : "—"; if (L === "fa") { var j = g2j(+m[1], +m[2], +m[3]); return D(j[0] + "/" + pad(j[1]) + "/" + pad(j[2])); } return m[1] + "-" + m[2] + "-" + m[3]; }
  function todayTehran() { return new Date(Date.now() + 3.5 * 3600 * 1000).toISOString().slice(0, 10); }
  function daysUntil(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ""); if (!m) return null; return Math.round((Date.UTC(+m[1], +m[2] - 1, +m[3]) - Date.UTC(+todayTehran().slice(0, 4), +todayTehran().slice(5, 7) - 1, +todayTehran().slice(8, 10))) / 86400000); }
  function clockTxt(ms) { return D(new Date(ms).toLocaleTimeString(L === "fa" ? "fa-IR-u-nu-latn" : "en-GB", { hour: "2-digit", minute: "2-digit" })); }
  function mmss(sec) { sec = Math.max(0, Math.floor(sec)); return D(pad(Math.floor(sec / 60)) + ":" + pad(sec % 60)); }

  /* ---------- network ---------- */
  function hdr(extra) { var h = { apikey: CFG.key, Authorization: "Bearer " + CFG.key }; for (var k in extra) h[k] = extra[k]; return h; }
  function rpc(name, args) {
    return fetch(CFG.url + "/rest/v1/rpc/" + name, { method: "POST", headers: hdr({ "Content-Type": "application/json" }), body: JSON.stringify(args || {}) }).then(function (r) {
      return r.text().then(function (txt) {
        var body = null; try { body = txt ? JSON.parse(txt) : null; } catch (e) { body = txt; }
        if (!r.ok) { var m = (body && body.message) || ""; var e2 = new Error(m || "http_" + r.status); e2.code = m; throw e2; }
        return body;
      });
    }, function () { var e = new Error("net"); e.code = "net"; throw e; });
  }
  function authed(name, args) {
    args = args || {}; args.p_token = S.sess && S.sess.token;
    return rpc(name, args).catch(function (e) { if (/bad_session/.test(e.code || "")) { signOut(true); } throw e; });
  }

  /* ---------- names / profile helpers ---------- */
  function ext() { return (S.me && S.me.ext) || {}; }
  function prof() { return (S.me && S.me.profile) || {}; }
  function personName() {
    var e = ext(), p = prof();
    var f = L === "fa" ? (e.firstNameFa || p.first_name) : (e.firstNameEn || p.first_name);
    var l = L === "fa" ? (e.lastNameFa || p.last_name) : (e.lastNameEn || p.last_name);
    return ((f || "") + " " + (l || "")).trim() || (S.sess && S.sess.username) || "";
  }

  /* ---------- notifications ---------- */
  function saveNotes() { S.notes = S.notes.slice(0, 60); lsSet(LSK.notes, S.notes); }
  function unreadNotes() { return S.notes.filter(function (n) { return !n.read; }).length; }
  function unreadMsgs() { var g = 0; S.grp.forEach(function (x) { g += x.unread || 0; }); return S.msgs.filter(function (m) { return m.staff && !m.read; }).length + S.dm.filter(function (m) { return !m.mine && !m.read; }).length + g; }
  function unreadStaff() { return S.msgs.filter(function (m) { return m.staff && !m.read; }).length; }
  function unreadPeer(id) { return S.dm.filter(function (m) { return m.peer === id && !m.mine && !m.read; }).length; }
  function pushActive() { return !!lsGet("mj_push", false) && typeof Notification !== "undefined" && Notification.permission === "granted"; }
  var AC = null;
  /* spoken call for the jumper's OWN load only (same wording as the desktop manifest: 20 / 15 / 10 minutes) */
  var VA = null, VQ = Promise.resolve();
  var SIL = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="; function vUnlock() { try { if (!VA) { VA = new Audio(); VA.preload = "auto"; } VA.src = SIL; var pr = VA.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) { /* ignore */ } }
  ["touchstart", "touchend", "pointerdown", "click", "keydown"].forEach(function (n) { document.addEventListener(n, function () { if (!VA || VA.paused) vUnlock(); }, true); });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { pinging = false; try { ping(); } catch (e) { /* ignore */ } } });
  function playClip(name) {
    return new Promise(function (res) {
      try {
        if (!VA) VA = new Audio(); var a = VA, done = false;
        var fin = function (ok) { if (done) return; done = true; clearTimeout(to); a.onended = a.onerror = null; res(ok); };
        var to = setTimeout(function () { fin(true); }, 30000);
        a.onended = function () { fin(true); }; a.onerror = function () { fin(false); };
        a.src = "voice/" + name + ".mp3"; a.volume = 1; var pr = a.play(); if (pr && pr.catch) pr.catch(function () { fin(false); });
      } catch (e) { res(false); }
    });
  }
  function ttsFallback(n, m) {
    if (!("speechSynthesis" in window)) return;
    try {
      var vs = window.speechSynthesis.getVoices() || [], fa = null;
      for (var i = 0; i < vs.length; i++) if (/^fa/i.test(vs[i].lang)) { fa = vs[i]; break; }
      var txt = fa ? "لود " + n + "، " + m + " دقیقه تا پرواز." + (m === 10 ? " لطفاً به محوطهٔ سوارشدن بروید." : "") : m + " minutes call for load " + n + "." + (m === 10 ? " Please proceed to the boarding area." : "");
      var u = new SpeechSynthesisUtterance(txt); u.lang = fa ? fa.lang : "en-US"; if (fa) u.voice = fa; u.rate = 0.95; u.volume = 1;
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    } catch (e) { /* no speech */ }
  }
  /* the SAME recordings the desktop Manifest plays: Persian first, then English */
  function speakClips(names, fallback) {
    if (!lsGet("mj_snd", true)) return;
    VQ = VQ.then(function () {
      return playClip(names[0]).then(function (ok) {
        if (!ok) { if (fallback) fallback(); return; }
        return new Promise(function (r) { setTimeout(r, 500); }).then(function () { return playClip(names[1]); });
      });
    }).catch(function () {});
  }
  function speakCall(n, m) { speakClips(["load-" + n + "-" + m, "load-" + n + "-" + m + "-en"], function () { ttsFallback(n, m); }); }
  function speakStandby() { speakClips(["standby", "standby-en"], null); }
  function beep() {
    if (!lsGet("mj_snd", true) || document.hidden) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume();
      var t = AC.currentTime; [[880, 0], [1175, 0.16]].forEach(function (p) { var o = AC.createOscillator(), g = AC.createGain(); o.type = "sine"; o.frequency.value = p[0]; g.gain.setValueAtTime(0.0001, t + p[1]); g.gain.exponentialRampToValueAtTime(0.25, t + p[1] + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + p[1] + 0.22); o.connect(g); g.connect(AC.destination); o.start(t + p[1]); o.stop(t + p[1] + 0.25); });
    } catch (e) { /* no sound */ }
  }
  function b64ToU8(b) { var p = "=".repeat((4 - b.length % 4) % 4), r = atob((b + p).replace(/-/g, "+").replace(/_/g, "/")), o = new Uint8Array(r.length); for (var i = 0; i < r.length; i++) o[i] = r.charCodeAt(i); return o; }
  function idbPut(rec) {
    try { var rq = indexedDB.open("mj", 1); rq.onupgradeneeded = function () { rq.result.createObjectStore("kv"); }; rq.onsuccess = function () { try { var tx2 = rq.result.transaction("kv", "readwrite"); if (rec) tx2.objectStore("kv").put(rec, "cfg"); else tx2.objectStore("kv").delete("cfg"); } catch (e) { /* ignore */ } }; } catch (e2) { /* ignore */ }
  }
  function pushSync() {
    if (!S.sess || !pushActive() || !("serviceWorker" in navigator)) return Promise.resolve(false);
    return navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription(); }).then(function (sub) {
      if (!sub) return false;
      idbPut({ url: CFG.url, key: CFG.key, token: S.sess.token });
      return authed("jumper_push_save", { p_endpoint: sub.endpoint }).then(function () { return true; });
    }).catch(function () { return false; });
  }
  function pushOn() {
    if (typeof Notification === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) { toast(tx("push_unsup")); return; }
    Notification.requestPermission().then(function (perm) {
      if (perm !== "granted") { toast(tx("push_denied")); render(); return; }
      return navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription().then(function (sub) { return sub || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(VAPID) }); }); }).then(function () { lsSet("mj_push", true); return pushSync(); }).then(function (ok) { if (!ok) { lsSet("mj_push", false); toast(tx("fail")); } else { beep(); toast(tx("push_ok")); } render(); });
    }).catch(function () { lsSet("mj_push", false); toast(tx("fail")); render(); });
  }
  function pushOff() {
    lsSet("mj_push", false);
    if ("serviceWorker" in navigator) navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription(); }).then(function (sub) { if (sub) { var ep = sub.endpoint; return sub.unsubscribe().then(function () { if (S.sess) return authed("jumper_push_del", { p_endpoint: ep }); }); } }).catch(function () {});
    idbPut(null); render();
  }
  function addNote(id, key, vars, icon) {
    if (S.notes.some(function (n) { return n.id === id; })) return;
    S.notes.unshift({ id: id, key: key, vars: vars || {}, icon: icon || "🔔", at: Date.now(), read: false });
    saveNotes();
    beep();
    if (key === "n_call" && vars) setTimeout(function () { speakCall(vars.n, vars.m); }, 700);
    if (!pushActive() && typeof Notification !== "undefined" && Notification.permission === "granted" && document.hidden) {
      var body = fmt(tx(key), vars || {});
      try { if (navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.ready.then(function (reg) { reg.showNotification("Manifest", { body: body, icon: "icon-192.png", badge: "icon-192.png", tag: id }); }); else new Notification("Manifest", { body: body, icon: "icon-192.png" }); } catch (e) { /* ignore */ }
    }
  }
  function noteText(n) { var v = {}; for (var k in (n.vars || {})) v[k] = n.vars[k]; if (v.what) v.what = tx(v.what); if (v.d !== undefined) v.d = D(v.d); if (v.n !== undefined) v.n = D(v.n); if (v.m !== undefined) v.m = D(v.m); return fmt(tx(n.key), v); }

  function loadsFlat() {
    var out = [];
    (S.loads || []).forEach(function (day) { (day.loads || []).forEach(function (l) { out.push({ date: day.date, l: l }); }); });
    return out;
  }
  function isMine(l) { var uid = S.me && S.me.uid; return !!uid && (l.slots || []).some(function (s) { return s.u === uid; }); }
  function remaining(l) { if (l.cs === "Running" && l.end) return (l.end - Date.now()) / 1000; return l.rem || 0; }

  function detectEvents() {
    var today = todayTehran(), prev = lsGet(LSK.prev, null), cur = {}, fired = lsGet(LSK.fired, {});
    loadsFlat().forEach(function (x) {
      if (x.date !== today) return;
      var l = x.l, key = x.date + "#" + l.n, mine = isMine(l);
      cur[key] = { m: mine, st: l.st };
      if (prev && S.me && S.me.uid) {
        var p = prev[key];
        if (mine && !(p && p.m)) addNote("add-" + key + "-" + Math.floor(Date.now() / 60000), "n_add", { n: l.n }, "✅");
        if (!mine && p && p.m) addNote("rem-" + key + "-" + Math.floor(Date.now() / 60000), "n_rem", { n: l.n }, "⚠️");
        if (mine && p && p.st !== l.st) { if (l.st === "Boarding") addNote("brd-" + key, "n_board", { n: l.n }, "🛫"); if (l.st === "Hold") addNote("hold-" + key + "-" + Math.floor(Date.now() / 60000), "n_hold", { n: l.n }, "⏸️"); }
      }
      if (mine && l.cs === "Running") {
        var r = remaining(l);
        [1200, 900, 600].forEach(function (th) {
          var fk = key + "#" + th;
          if (r <= th && r > th - 420 && !fired[fk]) { fired[fk] = 1; addNote("call-" + fk, "n_call", { n: l.n, m: th / 60 }, "⏰"); }
        });
      }
    });
    lsSet(LSK.prev, cur); lsSet(LSK.fired, fired);
  }
  function detectExpiry() {
    if (!S.me || !S.me.found) return;
    var p = prof(), e = ext(), items = [["w_mem", p.membership_expiry], ["w_med", e.medicalExpiry], ["w_ins", e.insuranceExpiry]];
    if (p.reserve_repack_date && p.rig_ownership !== "Rental") { var d = new Date(p.reserve_repack_date + "T12:00:00Z"); if (!isNaN(d)) { d.setUTCDate(d.getUTCDate() + 180); items.push(["w_rep", d.toISOString().slice(0, 10)]); } }
    items.forEach(function (it) {
      var du = daysUntil(it[1]); if (du === null) return;
      if (du < 0) addNote("exp-" + it[0] + "-" + it[1], "n_expd", { what: it[0] }, "❗");
      else if (du <= 30) addNote("exp-" + it[0] + "-" + it[1] + "-" + (du <= 7 ? "w" : "m"), "n_exp", { what: it[0], d: du }, "⌛");
    });
  }
  function detectMessages() {
    var seen = lsGet(LSK.seenMsg, 0), max = seen;
    S.msgs.forEach(function (m) { if (m.staff && m.id > seen) { addNote("msg-" + m.id, "n_msg", {}, "💬"); } if (m.id > max) max = m.id; });
    if (seen === 0 && S.msgs.length === 0) return; lsSet(LSK.seenMsg, max);
  }

  /* ---------- data refresh ---------- */
  var timers = [];
  function normLoads(days) {
    days.forEach(function (day) { (day.loads || []).forEach(function (l) {
      if (l.st0 === undefined) l.st0 = l.st;
      if (l.st !== "Completed" && l.st !== "Cancelled") { if (l.cs === "Hold") l.st = "Hold"; else if (l.st === "Preparation Complete") l.st = "Loading"; }
    }); });
    return days;
  }
  function isStandby(todays) {
    var act = todays.filter(function (x) { return x.l.st !== "Completed" && x.l.st !== "Cancelled"; });
    return act.length > 0 && act.every(function (x) { return x.l.cs === "Hold"; });
  }
  function refreshLoads() { return authed("jumper_loads").then(function (d) { var wasSb = S.sbOn; S.loads = normLoads(d || []); S.loadedAt = Date.now(); var nowSb = isStandby(loadsFlat().filter(function (x) { return x.date === todayTehran(); })); if (nowSb && wasSb === false) speakStandby(); S.sbOn = nowSb; detectEvents(); }).catch(function () {}); }
  function refreshMe() { return authed("jumper_me").then(function (d) { var sig = JSON.stringify(d), changed = sig !== S.meSig; S.meSig = sig; S.me = d; detectExpiry(); if (d && d.found && d.hasPhoto && !S.photo) { authed("jumper_photo").then(function (p) { S.photo = p || ""; render(); }).catch(function () {}); } return changed; }).catch(function () { return false; }); }
  function refreshMsgs() { return authed("jumper_messages_list2").then(function (d) { S.msgs = d || []; detectMessages(); if (S.tab === "msgs" && S.peer === "staff" && !document.hidden && unreadStaff() > 0) { authed("jumper_mark_read").then(function () { S.msgs.forEach(function (m) { if (m.staff) m.read = true; }); updateBadges(); }).catch(function () {}); } }).catch(function () {}); }

  function refreshDm() {
    return authed("jumper_dm_list2").then(function (d) {
      S.dm = d || []; var seen = lsGet("mj_seen_dm", 0), max = seen;
      S.dm.forEach(function (m) { if (!m.mine && m.id > seen) addNote("dm-" + m.id, "n_dm", {}, "💬"); if (m.id > max) max = m.id; });
      if (!(seen === 0 && S.dm.length === 0)) lsSet("mj_seen_dm", max);
      if (S.tab === "msgs" && isDm() && !document.hidden && unreadPeer(S.peer) > 0) { var pr = S.peer; authed("jumper_dm_read", { p_peer: pr }).then(function () { S.dm.forEach(function (m) { if (m.peer === pr && !m.mine) m.read = true; }); updateBadges(); }).catch(function () {}); }
    }).catch(function () {});
  }
  function refreshPeers() { return authed("jumper_people").then(function (d) { S.peers = d || []; }).catch(function () {}); }
  function peerName(id) { for (var i = 0; i < S.peers.length; i++) if (S.peers[i].id === id) { var p = S.peers[i]; return (L === "fa" ? p.fa || p.en : p.en || p.fa) || "—"; } return "—"; }
  function initials(n) { var w = String(n).split(/\s+/).filter(Boolean); return ((w[0] || "?").charAt(0) + (w[1] ? w[1].charAt(0) : "")).toUpperCase(); }
  /* groups */
  function gid() { return /^g:/.test(S.peer) ? +S.peer.slice(2) : 0; }
  function isGrp() { return !!gid(); }
  function isDm() { return !!S.peer && S.peer !== "staff" && S.peer !== "pick" && S.peer !== "gnew" && !isGrp(); }
  function chatOpen() { return !!S.peer && S.peer !== "pick" && S.peer !== "gnew"; }
  function grpById(id) { for (var i = 0; i < S.grp.length; i++) if (S.grp[i].id === id) return S.grp[i]; return null; }
  function presTxt(on) { return '<span class="pdot' + (on ? " on" : "") + '"></span>' + tx(on ? "on_l" : "off_l"); }
  function presPeer() { return S.peer === "staff" ? "staff" : isDm() ? S.peer : ""; }
  function presRefresh() {
    var pr = presPeer(); if (!pr || document.hidden || !S.sess) return;
    authed("jumper_presence_get", { p_peer: pr }).then(function (r) { S.pres[pr] = !!(r && r.on); var el = document.getElementById("pst"); if (el && presPeer() === pr) el.innerHTML = presTxt(S.pres[pr]); }).catch(function () {});
  }
  function presBeat() { if (S.sess && !document.hidden) authed("jumper_presence_beat").catch(function () {}); }
  function refreshGroups() {
    return authed("jumper_group_list").then(function (d) {
      S.grp = d || [];
      if (S.tab === "msgs" && isGrp() && !document.hidden) { var g = grpById(gid()); if (g && g.unread > 0) { var gi = g.id; authed("jumper_group_read", { p_gid: gi }).then(function () { var gg = grpById(gi); if (gg) gg.unread = 0; updateBadges(); }).catch(function () {}); } }
    }).catch(function () {});
  }
  function refreshGroupMsgs(id) { return authed("jumper_group_msgs", { p_gid: id }).then(function (d) { S.gm[id] = d || []; }).catch(function () {}); }
  var dmPinging = false;
  function dmPing() {
    if (dmPinging || document.hidden || !S.sess) return; dmPinging = true;
    authed("jumper_dm_ping").then(function (r) { dmPinging = false; if (!r) return; var sig = r.id + ":" + r.rd; if (sig !== S.pd) { S.pd = sig; refreshDm().then(softRender); } }).catch(function () { dmPinging = false; });
    authed("jumper_group_ping").then(function (r) { if (!r) return; var sig = r.id + ":" + r.n + ":" + r.mm; if (sig !== S.pgs) { S.pgs = sig; var ps = [refreshGroups()]; if (isGrp()) ps.push(refreshGroupMsgs(gid())); Promise.all(ps).then(softRender); } }).catch(function () {});
  }
  function curMsgs() {
    if (isGrp()) return (S.gm[gid()] || []).map(function (m) { return { id: m.id + 2000000000, rid: m.id, staff: !m.mine, body: m.body, attach: m.attach, at: m.at, who: m.u, rp: m.rp, fwd: m.fwd, kind: m.kind }; });
    if (!isDm()) return S.msgs.map(function (m) { return { id: m.id, rid: m.id, staff: m.staff, body: m.body, attach: m.attach, at: m.at, read: m.read, seen: m.seen, name: m.name, rp: m.rp, fwd: m.fwd }; });
    return S.dm.filter(function (m) { return m.peer === S.peer; }).map(function (m) { return { id: m.id + 1000000000, rid: m.id, staff: !m.mine, body: m.body, attach: m.attach, at: m.at, read: m.read, seen: m.read, name: "", rp: m.rp, fwd: m.fwd }; });
  }
  function msgByKey(k) { var cm = curMsgs(); for (var i = 0; i < cm.length; i++) if (cm[i].id === k) return cm[i]; return null; }
  function sendTo(target, body, attach, rp, fwd) {
    var a = { p_body: body || "", p_attach: attach || null, p_reply: rp || null, p_fwd: !!fwd };
    if (target === "staff") return authed("jumper_send2", a).then(function () { return refreshMsgs(); });
    if (/^g:/.test(target)) { a.p_gid = +target.slice(2); return authed("jumper_group_send", a).then(function () { return Promise.all([refreshGroupMsgs(a.p_gid), refreshGroups()]); }); }
    a.p_peer = target; return authed("jumper_dm_send2", a).then(function () { return refreshDm(); });
  }
  function chatPost(body, attach) {
    var rp = S.rep ? S.rep.rid : null;
    return sendTo(S.peer, body, attach, rp, false).then(function () { S.rep = null; S.stick = true; render(); });
  }
  function openChat(p) {
    S.peer = p; S.nm = false; S.anim = true; S.sel = 0; S.popAfter = 0; S.rep = null; S.selmode = false; S.ss = {}; S.menu = 0; S.cq = ""; S.sr = false; S.gi = false; S.gadd = null; S.gnew = p === "gnew" ? { name: "", sel: {}, q: "" } : null; S.stick = true;
    var cm = curMsgs(); S.popAfter = cm.length ? cm[cm.length - 1].id : 0;
    if (p === "staff") authed("jumper_mark_read").then(function () { S.msgs.forEach(function (m) { m.read = true; }); updateBadges(); }).catch(function () {});
    else if (isGrp()) { var g0 = +p.slice(2); refreshGroupMsgs(g0).then(function () { var c2 = curMsgs(); S.popAfter = c2.length ? c2[c2.length - 1].id : 0; if (S.peer === p) { S.stick = true; render(); } authed("jumper_group_read", { p_gid: g0 }).then(function () { var gg = grpById(g0); if (gg) gg.unread = 0; updateBadges(); }).catch(function () {}); }); }
    else if (p !== "pick" && p !== "gnew" && p) authed("jumper_dm_read", { p_peer: p }).then(function () { S.dm.forEach(function (m) { if (m.peer === p && !m.mine) m.read = true; }); updateBadges(); }).catch(function () {});
    render(); toTop();
    presRefresh();
    if (p === "pick" || p === "gnew") refreshPeers().then(function () { var l = document.getElementById("plist"); if (l) l.innerHTML = p === "gnew" ? gpickList() : pickList(); });
  }
  function refreshAll() { return Promise.all([refreshMe(), refreshLoads(), refreshMsgs(), refreshDm(), refreshPeers(), refreshGroups()]).then(function () { render(); }); }
  var pinging = false;
  function ping() {
    if (document.hidden || !S.sess || pinging) return; pinging = true; setTimeout(function () { pinging = false; }, 6000);
    dmPing();
    authed("jumper_ping").then(function (r) {
      pinging = false; if (!r) return; var jobs = [];
      if (r.feed !== S.pf) { S.pf = r.feed; jobs.push(refreshLoads()); }
      if (r.msg !== S.pm || r.staff !== S.ps || r.sig !== S.pg) { S.pm = r.msg; S.ps = r.staff; S.pg = r.sig; jobs.push(refreshMsgs()); }
      if (jobs.length) Promise.all(jobs).then(softRender);
    }).catch(function () { pinging = false; });
  }
  function startPolling() {
    stopPolling();
    pushSync(); presBeat(); presRefresh();
    timers.push(setInterval(presBeat, 30000)); timers.push(setInterval(presRefresh, 12000));
    timers.push(setInterval(ping, 1500));
    timers.push(setInterval(function () { if (!document.hidden && S.sess) refreshMe().then(function (ch) { if (ch) softRender(); }); }, 30000));
    timers.push(setInterval(function () { if (!document.hidden && S.sess) loadWeather().then(softRender); }, 600000));
    timers.push(setInterval(function () { if (!document.hidden && S.sess && (S.view === "f_log" || S.tab === "log")) refreshLog().then(function (ch) { if (ch) softRender(); }); }, 60000));
    timers.push(setInterval(tickCountdowns, 1000));
    loadWeather().then(softRender);
  }
  function stopPolling() { timers.forEach(clearInterval); timers = []; }
  document.addEventListener("visibilitychange", function () { if (!document.hidden && S.sess) refreshAll(); });
  var lastScroll = 0, srT = 0; document.addEventListener("scroll", function () { lastScroll = Date.now(); }, { passive: true, capture: true });
  function softRender() { if (Date.now() - lastScroll < 350) { clearTimeout(srT); srT = setTimeout(softRender, 380); return; } if (S.tab === "msgs" && S.sess && document.getElementById("thr")) { updateThread(); updateBadges(); return; } var a = document.activeElement; if (a && (a.tagName === "TEXTAREA" || a.tagName === "INPUT" || a.tagName === "SELECT")) { updateBadges(); return; } render(); }
  function tickCountdowns() { var els = document.querySelectorAll("[data-end]"); for (var i = 0; i < els.length; i++) { var end = +els[i].getAttribute("data-end"); els[i].textContent = mmss((end - Date.now()) / 1000); } detectEvents(); }
  function updateBadges() { var b = document.querySelectorAll(".badge[data-b]"); for (var i = 0; i < b.length; i++) { var k = b[i].getAttribute("data-b"); var n = k === "alerts" ? unreadNotes() : unreadMsgs(); b[i].textContent = D(n); b[i].style.display = n ? "" : "none"; } }

  /* ---------- actions ---------- */
  function setLang(l) { L = l; lsSet(LSK.lang, l); document.documentElement.lang = l; document.documentElement.dir = l === "fa" ? "rtl" : "ltr"; render(); }
  function toast(t) { S.toast = t; S.noscroll = true; render(); setTimeout(function () { if (S.toast === t) { S.toast = ""; S.noscroll = true; render(); } }, 3200); }
  function signOut(silent) { if (S.sess && !silent) { var tk0 = S.sess.token; try { if ("serviceWorker" in navigator) navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription(); }).then(function (sub) { if (sub) rpc("jumper_push_del", { p_token: tk0, p_endpoint: sub.endpoint }); }).catch(function () {}); } catch (e0) { /* ignore */ } } idbPut(null); if (S.sess && !silent) rpc("jumper_logout", { p_token: S.sess.token }).catch(function () {}); S.sess = null; S.me = null; S.loads = null; S.msgs = []; S.dm = []; S.peers = []; S.peer = ""; S.pd = undefined; S.photo = ""; S.view = ""; S.edit = null; S.modal = ""; S.sos = null; S.log = null; S.logSig = ""; S.meSig = ""; S.pf = S.pm = S.ps = S.pg = undefined; S.pend = []; S.sel = 0; S.img = ""; try { localStorage.removeItem(LSK.sess); sessionStorage.removeItem(LSK.sess); } catch (e) { /* ignore */ } stopPolling(); render(); }
  function doLogin(u, p, remember) {
    S.err = ""; if (!u || !p) { S.err = tx("fill"); return render(); }
    S.busy = true; render();
    var latin = u.replace(/[۰-۹]/g, function (d) { return FAD.indexOf(d); }).replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }).trim();
    rpc("jumper_login", { p_user: latin, p_pass: p }).then(function (r) {
      S.sess = { token: r.token, username: r.username }; if (r.must_change) { S.sess.mustChange = true; S.tempOld = p; S.tab = "me"; S.view = "f_pw"; } saveSess(S.sess, remember); S.busy = false; if (!S.sess.mustChange) S.tab = "loads"; localStorage.removeItem(LSK.prev); render(); refreshAll().then(startPolling);
    }).catch(function (e) { S.busy = false; var c = (e.code || "").replace(/^.*?(bad_login|locked|pending|net).*$/, "$1"); S.err = tx(["bad_login", "locked", "pending", "net"].indexOf(c) >= 0 ? c : "fail"); render(); });
  }
  function setTab(t) { S.tab = t; S.view = ""; lsSet(LSK.tab, t); if (t === "msgs") S.peer = ""; if (t === "log") refreshLog().then(function () { if (S.tab === "log") render(); }); S.anim = true; render(); toTop(); }
  function sendMsg(body, attach) {
    return authed("jumper_send", { p_body: body, p_attach: attach || null }).then(function () { return refreshMsgs(); }).then(function () { render(); });
  }
  function uploadDoc(kind, file) {
    var okType = /^(image\/(jpeg|png|webp)|application\/pdf)$/.test(file.type);
    if (!okType || file.size > 5 * 1024 * 1024) return toast(tx("big"));
    var safe = file.name.replace(/[^A-Za-z0-9._-]/g, "_").slice(-60) || "file";
    var path = "jumper/" + S.sess.username + "/" + Date.now() + "-" + kind + "-" + safe;
    toast("…");
    fetch(CFG.url + "/storage/v1/object/registration-docs/" + path, { method: "POST", headers: hdr({ "Content-Type": file.type, "x-upsert": "false" }), body: file })
      .then(function (r) { if (!r.ok) throw new Error("up"); return sendMsg("", { kind: kind, path: path, name: file.name, mime: file.type, size: file.size }); })
      .then(function () { if (kind === "photo") { var fr = new FileReader(); fr.onload = function () { S.photo = String(fr.result); if (S.me) S.me.hasPhoto = true; render(); }; fr.readAsDataURL(file); } toast(tx("uploaded")); }).catch(function () { toast(tx("fail")); });
  }
  function askNotif() { if (typeof Notification === "undefined") return toast(tx("fail")); Notification.requestPermission().then(function () { render(); }); }

  /* ---------- views ---------- */
  function langSwitch() { return '<span class="langsw"><button data-lang="fa" class="' + (L === "fa" ? "on" : "") + '">فارسی</button><button data-lang="en" class="' + (L === "en" ? "on" : "") + '">English</button></span>'; }
  function viewLogin() {
    return '<div class="login"><form class="login-card" id="lf" autocomplete="on"><img class="logo" src="logo.png" alt=""><h1>' + tx("app") + '</h1><p class="sub">' + tx("sub") + '</p>' +
      '<label class="fld"><span>' + tx("user") + '</span><input id="lu" class="ltr" inputmode="text" autocomplete="username" autocapitalize="off" spellcheck="false"></label>' +
      '<label class="fld"><span>' + tx("pass") + '</span><input id="lp" class="ltr" type="password" autocomplete="current-password"></label>' +
      '<label class="chk"><input type="checkbox" id="lr" checked> <span>' + tx("remember") + '</span></label>' +
      '<div class="err" role="alert">' + esc(S.err) + '</div><button class="btn pri" type="submit"' + (S.busy ? " disabled" : "") + '>' + tx("login") + '</button>' +
      '<div class="linkrow" style="justify-content:center"><a href="#" data-act="forgot">' + tx("forgot") + '</a></div><div class="regbox"><span>' + tx("reg_q") + '</span><a class="btn regbtn" href="register.html">' + tx("reg_acct") + '</a></div><div class="linkrow" style="justify-content:center">' + langSwitch() + '</div></form></div>';
  }
  function viewForgot() {
    var body;
    if (S.forgotCode) body = '<p class="sub">' + tx("code_h") + '</p><div class="count" style="text-align:center;margin:6px 0 10px;font-size:34px">' + esc(S.forgotCode) + '</div><p class="muted" style="text-align:center">' + tx("code_note") + '</p>';
    else body = '<p class="sub">' + tx("forgot_h") + '</p><label class="fld"><span>' + tx("user") + '</span><input id="fu" class="ltr" autocapitalize="off" spellcheck="false"></label><label class="fld"><span>' + tx("forgot_phone") + '</span><input id="fp" class="ltr" type="tel" inputmode="tel"></label><div class="err" role="alert">' + esc(S.err) + '</div><button class="btn pri" type="submit"' + (S.busy ? " disabled" : "") + '>' + tx("send_req") + '</button>';
    return '<div class="login"><form class="login-card" id="ff" autocomplete="off"><img class="logo" src="logo.png" alt=""><h1>' + tx("forgot_t") + '</h1>' + body +
      '<div class="linkrow"><a href="#" data-act="tologin">' + tx("to_login") + '</a>' + langSwitch() + '</div></form></div>';
  }
  function pwBody() {
    return (S.sess && S.sess.mustChange ? '<div class="card mine"><b>' + tx("must_h") + '</b></div>' : "") + '<form id="pf" class="card" autocomplete="off"><label class="fld"><span>' + tx("pw_old") + '</span><input id="po" class="ltr" type="password" autocomplete="current-password" value="' + esc(S.tempOld || "") + '"></label>' +
      '<label class="fld"><span>' + tx("pw_new") + '</span><input id="pn" class="ltr" type="password" autocomplete="new-password"></label>' +
      '<label class="fld"><span>' + tx("pw_new2") + '</span><input id="pn2" class="ltr" type="password" autocomplete="new-password"></label>' +
      '<div class="err" role="alert">' + esc(S.err) + '</div><button class="btn pri" type="submit">' + tx("pw_save") + '</button></form>';
  }
  function chipFor(st) { var cls = st === "Boarding" || st === "Ready" || st === "Preparation Complete" ? "go" : st === "Completed" ? "ok" : st === "Cancelled" || st === "Hold" ? "bad" : ""; var v = TX.st[st]; return '<span class="chip ' + cls + '">' + esc(v ? v[L === "fa" ? 0 : 1] : st) + "</span>"; }
  function loadInfoGrid(l, free) {
    return '<div class="ldgrid"><div><span>' + tx("g_type") + "</span><b>" + esc(l.type || "—") + "</b></div><div><span>" + tx("g_serial") + '</span><b class="ltr">' + esc(l.ac || "—") + "</b></div><div><span>" + tx("g_alt") + "</span><b>" + (l.alt ? D(l.alt) + ' <span dir="ltr">ft</span>' : "—") + "</b></div><div><span>" + tx("g_seats") + "</span><b>" + D((l.slots || []).length) + " / " + D(l.cap || 0) + "</b></div><div><span>" + tx("g_free") + "</span><b>" + D(free) + "</b></div><div><span>" + tx("g_pur") + "</span><b>" + esc(l.pur || "—") + "</b></div></div>";
  }
  function loadCard(x) {
    var l = x.l, mine = isMine(l), key = x.date + "#" + l.n, slots = l.slots || [], cap = l.cap || 0, free = Math.max(0, cap - slots.length);
    var cls = { Open: "open", Loading: "load", Ready: "ready", "Preparation Complete": "ready", Boarding: "board", Hold: "hold", Completed: "done", Cancelled: "canc" }[l.st] || "open";
    var showChip = /^(Boarding|Hold|Completed|Cancelled|Ready|Preparation Complete)$/.test(l.st || "");
    var dots = ""; if (cap && cap <= 24) { for (var i = 0; i < cap; i++) dots += '<i class="' + (i < slots.length ? "f" : "") + '"></i>'; } else dots = '<span class="sbar"><i style="width:' + (cap ? Math.min(100, Math.round(slots.length * 100 / cap)) : 0) + '%"></i></span>';
    var h = '<div class="card ld c2 st-' + cls + (mine ? " mine" : "") + '" data-act="openload" data-key="' + esc(key) + '"><div class="c2-n"><small>' + tx("load") + "</small><b>" + D(l.n) + '</b></div><span class="c2-st">' + esc((TX.st[l.st] || [l.st, l.st])[L === "fa" ? 0 : 1]) + '</span><div class="c2-b"><div class="c2-t"><span class="c2-ty">' + esc(l.type || l.ac || "—") + "</span>" + (l.type && l.ac ? '<small class="c2-sn ltr">' + esc(l.ac) + "</small>" : "") + (mine ? '<span class="chip me">★ ' + tx("you") + "</span>" : "") + "";
    h += '</div>';
    if (l.cs === "Running" && l.end && remaining(l) > 0) h += '<span class="count sm c2-cd" data-end="' + l.end + '">' + mmss(remaining(l)) + "</span>";
    else if (l.cs === "Hold" && l.rem) h += '<span class="count sm c2-cd hold">' + mmss(l.rem) + "</span>";
    h += '<div class="c2-m">' + [l.alt ? '<span dir="ltr">' + D(l.alt) + " ft</span>" : "", esc(l.pur || "")].filter(Boolean).join(" · ") + '</div><div class="c2-s"><span class="dots">' + dots + "</span><b>" + D(slots.length) + "/" + D(cap) + "</b>" + (free ? "<em>" + tx("g_free") + " " + D(free) + "</em>" : "") + '</div></div><span class="c2-go">›</span></div>';
    return h;
  }
  function findLoad(key) { var all = loadsFlat(); for (var i = 0; i < all.length; i++) if (all[i].date + "#" + all[i].l.n === key) return all[i]; return null; }
  function shortName(full) {
    var w = String(full || "").trim().split(/\s+/); if (w.length < 2) return w[0] || "";
    return L === "fa" ? w.slice(1).join(" ") : w[0].charAt(0).toUpperCase() + ". " + w.slice(1).join(" ");
  }
  function jtAb(v) { var k = String(v || "").trim(), m = { belly: "BF", tracking: "TRK", freefly: "FF", wingsuit: "WS", "canopy piloting": "CP", "canopy formation": "CF", "coach jump": "CJ", "camera flyer": "CAMERA", accuracy: "AC", tandem: "TM", "tandem student": "TM ST", solo: "SOLO" }; return m[k.toLowerCase()] || k; }
  function noCam(v) { return String(v === null || v === undefined ? "" : v).replace(/[\u{1F4F7}\u{1F4F8}\u{1F4F9}\u{1F3A5}\u{1F3A6}\u{1F4FD}\uFE0F]/gu, "").replace(/\s+/g, " ").trim(); }
  function licNo(v) { v = noCam(v); if (!v) return "—"; v = v.replace(/^\(?\s*[A-Za-z]{3,}\)?[\s:\-–]+/, "").replace(/^\(?\s*[A-Za-z]{3,}\)?\s+(?=[A-Za-z]-?\d)/, ""); return v || "—"; }
  function loadModal() {
    var x = S.modal && findLoad(S.modal); if (!x) return "";
    var l = x.l, slots = l.slots || [], free = Math.max(0, (l.cap || 0) - slots.length);
    var h = '<div class="modal" data-act="closemodal"><div class="sheet paperwrap"><div class="paper"><div class="pp-band"><button class="pp-x" data-act="closemodal">✕</button><b class="pp-t">' + tx("load") + " " + D(l.n) + "</b></div>";
    if (l.cs === "Running" && l.end && remaining(l) > 0) h += '<div class="pp-time"><span class="count sm" data-end="' + l.end + '">' + mmss(remaining(l)) + "</span> " + tx("leaves") + "</div>";
    h += '<div class="pp-tbl"><div class="pp-r pp-h"><span>#</span><span>' + tx("p_name") + "</span><span>" + tx("g_lic") + "</span><span>" + tx("p_jt") + "</span><span>" + tx("p_det") + "</span><span>" + tx("log_alt") + "</span></div>";
    h += slots.length ? slots.map(function (s2, i) {
      var nm = shortName(L === "fa" ? (s2.fa || s2.en) : (s2.en || s2.fa)), me = S.me && s2.u === S.me.uid;
      return '<div class="pp-r' + (me ? " me" : "") + '"><span>' + D(i + 1) + "</span><span class=\"pp-nm\">" + esc(noCam(nm)) + "</span><span>" + esc(D(licNo(s2.lic))) + "</span><span>" + esc(jtAb(noCam(s2.jt)) || "—") + "</span><span>" + esc(noCam(s2.d)) + "</span><span>" + (s2.alt ? D(s2.alt) : "—") + "</span></div>";
    }).join("") : '<div class="pp-none">' + tx("none_on") + "</div>";
    return h + "</div></div></div></div>";
  }
  function viewLoads() {
    var all = loadsFlat(), today = todayTehran(), todays = all.filter(function (x) { return x.date === today; });
    var mine = todays.filter(function (x) { return isMine(x.l); }), h = weatherCard();
    if (S.loadedAt) h += '<p class="muted">' + tx("upd") + ": " + clockTxt(S.loadedAt) + " · " + tx("today") + " " + dateTxt(today) + "</p>";
    if (!todays.length) return h + '<div class="empty">' + tx("loads_none") + "</div>";
    if (mine.length) h += '<div class="h2">' + tx("loads_mine") + "</div>" + mine.map(loadCard).join("");
    var others = todays.filter(function (x) { return !isMine(x.l); });
    if (others.length) h += '<div class="h2">' + tx("loads_all") + "</div>" + others.map(loadCard).join("");
    return h;
  }

  /* ---------- weather ---------- */
  var WX = { 0: ["☀️", "آسمان صاف", "Clear sky"], 1: ["🌤️", "عمدتاً صاف", "Mostly clear"], 2: ["⛅", "کمی ابری", "Partly cloudy"], 3: ["☁️", "ابری", "Overcast"], 45: ["🌫️", "مه", "Fog"], 48: ["🌫️", "مه یخ‌زده", "Rime fog"], 51: ["🌦️", "نم‌نم باران", "Drizzle"], 53: ["🌦️", "نم‌نم باران", "Drizzle"], 55: ["🌦️", "نم‌نم باران", "Drizzle"], 61: ["🌧️", "باران", "Rain"], 63: ["🌧️", "باران", "Rain"], 65: ["🌧️", "باران شدید", "Heavy rain"], 71: ["❄️", "برف", "Snow"], 73: ["❄️", "برف", "Snow"], 75: ["❄️", "برف شدید", "Heavy snow"], 80: ["🌧️", "رگبار", "Showers"], 81: ["🌧️", "رگبار", "Showers"], 82: ["⛈️", "رگبار شدید", "Violent showers"], 95: ["⛈️", "رعد و برق", "Thunderstorm"], 96: ["⛈️", "رعد و برق و تگرگ", "Thunderstorm with hail"], 99: ["⛈️", "رعد و برق و تگرگ", "Thunderstorm with hail"] };
  var DIRS = [["شمال", "N"], ["شمال شرق", "NE"], ["شرق", "E"], ["جنوب شرق", "SE"], ["جنوب", "S"], ["جنوب غرب", "SW"], ["غرب", "W"], ["شمال غرب", "NW"]];
  function loadWeather() {
    return authed("jumper_wx").catch(function () { return null; }).then(function (p) {
      if (p && p.lat != null && p.lon != null) S.wxPlace = { lat: p.lat, lon: p.lon, name: p.name || "" };
      var w = S.wxPlace || CFG.wx || { lat: 35.6892, lon: 51.389, name: "" };
      var url = "https://api.open-meteo.com/v1/forecast?latitude=" + w.lat + "&longitude=" + w.lon + "&current=temperature_2m,apparent_temperature,relative_humidity_2m,dew_point_2m,pressure_msl,wind_speed_10m,wind_gusts_10m,wind_direction_10m,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,precipitation,weather_code,visibility&wind_speed_unit=kn&timezone=auto";
      return fetch(url).then(function (r) { return r.json(); }).then(function (j) { if (j && j.current) { S.wx = j.current; S.wxAt = Date.now(); } });
    }).catch(function () {});
  }
  function weatherCard() {
    var w = S.wxPlace || CFG.wx || { name: "" }, c = S.wx;
    var wc = c ? c.weather_code : 0, wk = wc <= 1 ? "clear" : wc <= 3 ? "cloud" : wc <= 48 ? "fog" : (wc >= 71 && wc <= 77) || wc === 85 || wc === 86 ? "snow" : "rain";
    var h = '<div class="card wx4 wk-' + wk + '"><div class="wx4-top"><span class="wxi">' + (c ? (WX[c.weather_code] || WX[3])[0] : "⛅") + '</span><div class="wx4-m"><b class="wx4-t" dir="ltr">' + (c ? D(Math.round(c.temperature_2m)) + "°C" : "—") + '</b><span class="wx4-d">' + (c ? (WX[c.weather_code] || WX[3])[L === "fa" ? 1 : 2] : "…") + '</span></div><div class="wx4-p">' + (w.name ? "<b>" + esc(w.name) + "</b>" : "") + "<span>" + (c ? tx("upd") + " " + clockTxt(S.wxAt) : "") + (c && c.apparent_temperature != null ? " · " + tx("wx_feels") + " " + D(Math.round(c.apparent_temperature)) + "°" : "") + "</span></div></div>";
    if (c) {
      var dir = DIRS[Math.round((c.wind_direction_10m || 0) / 45) % 8][L === "fa" ? 0 : 1], dg = Math.round(c.wind_direction_10m || 0);
      var base = c.temperature_2m != null && c.dew_point_2m != null ? Math.max(0, Math.round((c.temperature_2m - c.dew_point_2m) * 400 / 100) * 100) : null;
      function tile(icn, lab, val, cls) { return '<div class="wx4-c ' + (cls || "") + '"><span class="wl">' + ic(icn) + lab + '</span><b dir="ltr">' + val + "</b></div>"; }
      function pct(v) { return v == null ? "—" : D(Math.round(v)) + "%"; }
      h += '<div class="wx4-g">' + tile("wind", tx("wx_wind"), D(Math.round(c.wind_speed_10m)) + " kt") + tile("wind", tx("wx_gust"), D(Math.round(c.wind_gusts_10m)) + " kt", "hot") +
        '<div class="wx4-c"><span class="wl">' + ic("compass") + tx("wx_dir") + '</span><b dir="ltr"><svg class="ico warr" viewBox="0 0 24 24" style="transform:rotate(' + dg + 'deg)"><path d="M12 4v16M6.500 14.500L12 20l5.500-5.500"/></svg> ' + esc(dir) + " " + D(dg) + "°</b></div>" +
        "</div><div class=\"wx4-g g4\">" + tile("drop", tx("wx_hum"), pct(c.relative_humidity_2m)) + tile("cloud", tx("wx_cloud"), pct(c.cloud_cover)) + tile("layers", tx("wx_base"), base == null ? "—" : D(base) + " ft") +
        tile("eye", tx("wx_vis"), c.visibility != null ? D(Math.round(c.visibility / 100) / 10) + " km" : "—") + "</div>";
    }
    return h + "</div>";
  }
  function sosModal() {
    if (!S.sos) return "";
    var st = S.sos.step, h = '<div class="modal" data-act="soscancel"><div class="sheet sos"><div class="ld-title">🆘 SOS</div>';
    if (st === "done") h += '<p>' + tx("sos_done") + "</p>" + (S.sos.pos ? '<p class="muted ltr">' + S.sos.pos + "</p>" : '<p class="muted">' + tx("sos_nopos") + "</p>") + '<button class="btn pri" data-act="soscancel">' + tx("close") + "</button>";
    else h += "<p>" + tx("sos_text") + '</p><div class="err">' + esc(S.sos.err || "") + '</div><button class="btn pri danger" data-act="sosgo"' + (st === "sending" ? " disabled" : "") + ">" + (st === "sending" ? "…" : tx("sos_send")) + '</button><button class="btn wide" data-act="soscancel" style="margin-top:8px">' + tx("cancel") + "</button>";
    return h + "</div></div>";
  }
  function sendSos() {
    S.sos.step = "sending"; S.sos.err = ""; render();
    function fin(pos) {
      var attach = { kind: "sos", path: "jumper/" + S.sess.username + "/sos-" + Date.now(), name: "SOS", mime: "application/json" };
      if (pos) { attach.lat = pos.latitude; attach.lon = pos.longitude; attach.acc = pos.accuracy; }
      sendMsg("🆘 SOS", attach).then(function () { S.sos = { step: "done", pos: pos ? pos.latitude.toFixed(5) + ", " + pos.longitude.toFixed(5) : "" }; render(); }).catch(function () { S.sos = { step: "ask", err: tx("fail") }; render(); });
    }
    if (!navigator.geolocation) return fin(null);
    navigator.geolocation.getCurrentPosition(function (p) { fin(p.coords); }, function () { fin(null); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
  }
  function bellModal() {
    if (!S.bell) return "";
    var h = '<div class="modal" data-act="closebell"><div class="sheet"><div class="ld-title">' + ic("alerts") + " " + tx("t_alerts") + "</div>";
    if (!S.notes.length) h += '<div class="empty">' + tx("alerts_none") + "</div>";
    else h += '<div class="notelist">' + S.notes.map(function (n) { return '<div class="note"><div class="ni">' + n.icon + '</div><div class="grow">' + esc(noteText(n)) + '<div class="muted">' + dateTxt(new Date(n.at).toISOString().slice(0, 10)) + " " + clockTxt(n.at) + "</div></div></div>"; }).join("") + "</div>";
    return h + '<div class="rowbtns">' + (S.notes.length ? '<button class="btn sm" data-act="clearnotes">' + tx("clear") + "</button>" : "") + '<button class="btn pri sm" data-act="closebell">' + tx("close") + "</button></div></div></div>";
  }
  function viewLogTab() { return '<div class="backrow"><b class="ftitle">' + tx("f_log") + "</b></div>" + logBody(); }
  function viewSettings() {
    var bgOn = lsGet("mj_bg", true), np = typeof Notification === "undefined" ? "" : Notification.permission;
    var h = '<div class="h2">' + tx("s_lang") + '</div><div class="card setrow">' + langSwitch() + "</div>";
    var pOn = pushActive(), ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window.navigator.standalone || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches));
    h += '<div class="h2">' + tx("s_notif") + '</div><div class="card setrow"><span class="grow">' + tx("push_t") + '</span><button class="switch' + (pOn ? " on" : "") + '" data-act="pushtog" aria-pressed="' + (pOn ? "true" : "false") + '"><i></i></button></div>';
    h += '<div class="card setrow"><span class="grow">' + tx("snd_t") + '</span><button type="button" class="btn sm" data-act="sndtest">▶ ' + tx("snd_test") + '</button><button class="switch' + (lsGet("mj_snd", true) ? " on" : "") + '" data-act="sndtog" aria-pressed="' + (lsGet("mj_snd", true) ? "true" : "false") + '"><i></i></button></div>';
    h += '<p class="muted small" style="margin:-4px 4px 12px">' + tx(typeof Notification !== "undefined" && Notification.permission === "denied" ? "push_blocked" : ios ? "push_ios" : "push_hint") + "</p>";
    h += '<div class="card setrow"><span class="grow">' + tx("s_bg") + '</span><button class="switch' + (bgOn ? " on" : "") + '" data-act="setbg" aria-pressed="' + (bgOn ? "true" : "false") + '"><i></i></button></div>';
    h += '<div class="h2">' + tx("s_acct") + '</div><div class="card"><div class="kv"><div><span>' + tx("s_user") + '</span><span class="ltr">' + esc(D(S.sess.username)) + '</span></div><div><span>' + tx("f_pw") + '</span><span><button class="btn sm" data-act="gopw">' + tx("f_pw") + '</button></span></div></div></div>';
    h += '<div class="h2">' + tx("s_app") + '</div><div class="card"><div class="kv"><div><span>' + tx("s_ver") + '</span><span class="ltr">' + APPV + '</span></div></div><p class="muted small">' + tx("s_install") + '</p></div>';
    return h + '<button class="btn wide danger" data-act="logout">' + ic("logout") + " " + tx("logout") + "</button>";
  }
  (function () { var N = { on_l: ["آنلاین", "Online"], off_l: ["آفلاین", "Offline"] }; for (var k in N) if (!TX[k]) TX[k] = N[k]; })();
  /* ---------- push texts ---------- */
  (function () {
    var N = { push_t: ["اعلان روی گوشی (حتی وقتی برنامه بسته است)", "Phone notifications (even when the app is closed)"], snd_test: ["تست صدا", "Test voice"], snd_t: ["صدای اعلان داخل برنامه", "Sound inside the app"],
      push_ok: ["اعلان‌ها فعال شد.", "Notifications are on."], push_denied: ["اجازهٔ اعلان داده نشد. از تنظیمات مرورگر آن را باز کنید.", "Permission was not given. Allow notifications in the browser settings."],
      push_unsup: ["این مرورگر اعلان را پشتیبانی نمی‌کند.", "This browser does not support notifications."],
      push_hint: ["پیام‌ها و اعلان لودها (اضافه یا حذف‌شدن، شروع سوارشدن، توقف و ۲۰/۱۵/۱۰ دقیقه مانده به پرواز) با صدا روی گوشی می‌آید.", "Messages and load alerts (added/removed, boarding, hold, and 20/15/10 minutes to takeoff) arrive on your phone with a sound."],
      push_ios: ["در آیفون ابتدا برنامه را از منوی اشتراک‌گذاری (Share) با «Add to Home Screen» به صفحهٔ اصلی اضافه کنید، سپس اعلان را روشن کنید.", "On iPhone, first add the app to your Home Screen (Share → Add to Home Screen), then switch notifications on."],
      push_blocked: ["اعلان برای این سایت در مرورگر مسدود است؛ از تنظیمات مرورگر (قفل کنار آدرس) آن را آزاد کنید.", "Notifications are blocked for this site; unblock them in the browser settings (lock icon by the address)."] };
    for (var k in N) if (Object.prototype.hasOwnProperty.call(N, k) && !TX[k]) TX[k] = N[k];
  })();
  /* ---------- chat v2 texts ---------- */
  (function () {
    var N = {
      reply_b: ["پاسخ", "Reply"], fwd_b: ["فوروارد", "Forward"], copy_b: ["کپی", "Copy"], select_b: ["انتخاب", "Select"], delete_b: ["حذف", "Delete"],
      fwd_lbl: ["فوروارد شده", "Forwarded"], you: ["شما", "You"], deleted_msg: ["پیام حذف شده", "Deleted message"],
      search_ph: ["جستجو در این گفتگو…", "Search this chat…"], search_all: ["جستجو در گفتگوها و پیام‌ها…", "Search chats and messages…"], no_match: ["نتیجه‌ای نیست", "No results"],
      sel_n: ["انتخاب شد", "selected"], fwd_to: ["فوروارد به", "Forward to"], fwd_done: ["فوروارد شد", "Forwarded"], del_q: ["این پیام‌ها برای همه حذف شوند؟", "Delete these messages for everyone?"],
      c2_ok: ["تأیید", "OK"], c2_cancel: ["انصراف", "Cancel"], new_chat: ["گفتگوی جدید", "New chat"], new_group: ["گروه جدید", "New group"],
      g_name_ph: ["نام گروه", "Group name"], g_create: ["ساخت گروه", "Create group"], g_members: ["عضو", "members"], g_created: ["گروه ساخته شد", "Group created"],
      g_add: ["افزودن عضو", "Add members"], g_leave: ["ترک گروه", "Leave group"], g_leave_q: ["از این گروه خارج می‌شوید؟", "Leave this group?"], g_admin: ["مدیر", "Admin"],
      g_remove: ["حذف", "Remove"], g_rename: ["تغییر نام", "Rename"], g_pick: ["اعضا را انتخاب کنید", "Choose members"], g_need: ["نام گروه و حداقل یک عضو لازم است", "Enter a group name and pick at least one member"],
      copied: ["کپی شد", "Copied"], sel_all: ["انتخاب همه", "Select all"], clr_b: ["پاک‌کردن تاریخچه", "Clear history"], clr_all_b: ["پاک‌کردن همه", "Clear all"], clr_q: ["تاریخچهٔ این گفتگو فقط برای شما پاک شود؟", "Clear this chat's history for you?"], clr_all_q: ["تاریخچهٔ همهٔ گفتگوها فقط برای شما پاک شود؟", "Clear the history of all chats for you?"], clr_done: ["پاک شد", "Cleared"], cant_del: ["این پیام‌ها قابل حذف نیستند", "These messages can't be deleted"]
    };
    for (var k in N) if (Object.prototype.hasOwnProperty.call(N, k) && !TX[k]) TX[k] = N[k];
  })();
  /* ---------- chat (WhatsApp-style) ---------- */
  var CHAT_URL = CFG.url + "/storage/v1/object/public/chat-files/";
  var AUD = {}, recTimer = 0;
  S.pend = []; S.rec = null; S.sel = 0; S.img = "";
  var OKTYPE = /^(image\/(jpeg|png|webp|gif)|audio\/(webm|ogg|mp4|mpeg|aac|x-m4a|wav)|video\/(mp4|webm)|application\/(pdf|zip|msword|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet))|text\/plain)$/;
  function fileUrl(a) { return CHAT_URL + String(a.path).split("/").map(encodeURIComponent).join("/"); }
  function sizeTxt(n) { return !n ? "" : n > 1048576 ? D((n / 1048576).toFixed(1)) + " MB" : D(Math.max(1, Math.round(n / 1024))) + " KB"; }
  function dayKey(at) { return new Date(new Date(at).getTime() + 3.5 * 3600 * 1000).toISOString().slice(0, 10); }
  function dayLabel(k) { var t = todayTehran(); if (k === t) return tx("today"); var y = new Date(Date.parse(t + "T12:00:00Z") - 86400000).toISOString().slice(0, 10); return k === y ? tx("yesterday") : dateTxt(k); }
  var GCOL = ["#f2c94c", "#5aa9e6", "#6fcf7a", "#e8705f", "#c08cf0", "#3fb8a5", "#f28c28", "#ee8fb0"];
  function gcol(id) { var h = 0, s = String(id); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return GCOL[h % GCOL.length]; }
  function lastOf(arr) { return arr.length ? arr[arr.length - 1] : null; }
  function prevTxt(m) { if (!m) return ""; var a = m.attach; if (a && a.kind === "chat") return a.type === "image" ? "📷 " + tx("photo_lbl") : a.type === "voice" ? "🎙 " + tx("voice_lbl") : "📄 " + (a.name || ""); if (a && a.kind === "sos") return "🆘 SOS"; return m.body || ""; }
  function hlTxt(s) {
    var q = (S.cq || "").trim(); if (!q) return esc(s);
    var re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), out = "", last = 0, m;
    while ((m = re.exec(s))) { if (!m[0]) { re.lastIndex++; continue; } out += esc(s.slice(last, m.index)) + '<mark class="hit">' + esc(m[0]) + "</mark>"; last = m.index + m[0].length; }
    return out + esc(s.slice(last));
  }
  function matchKeys() {
    var q = (S.cq || "").trim().toLowerCase(), r = []; if (!q) return r;
    curMsgs().forEach(function (m) { var t = ((m.body || "") + " " + (m.attach && m.attach.kind === "chat" ? m.attach.name || "" : "")).toLowerCase(); if (t.indexOf(q) >= 0) r.push(m.id); });
    return r;
  }
  function senderLabel(m) {
    if (!m.staff) return tx("you");
    if (isGrp()) return peerName(m.who);
    return S.peer === "staff" ? tx("chat_title") : peerName(S.peer);
  }
  function quoteHtml(m) {
    if (!m.rp) return "";
    var cm = curMsgs(), o = null; for (var i = 0; i < cm.length; i++) if (cm[i].rid === m.rp) { o = cm[i]; break; }
    return '<div class="quote" data-act="gotomsg" data-rid="' + m.rp + '"><b' + (o && o.staff && isGrp() ? ' style="color:' + gcol(o.who) + '"' : "") + ">" + esc(o ? senderLabel(o) : "") + "</b><span>" + esc(o ? prevTxt(o) : tx("deleted_msg")) + "</span></div>";
  }
  function selectable(m) { return !m.attach || m.attach.kind === "chat"; }
  function myAdmin() { var g = grpById(gid()); return !!(g && g.admin); }
  function canDel(m) { if (!selectable(m)) return false; if (isGrp()) return !m.staff || myAdmin(); return true; }
  function bubble(m, pop) {
    var a = m.attach, inner = "", mine = !m.staff;
    if (m.kind === "created") return '<div class="dsep"><span>' + tx("g_created") + "</span></div>";
    if (m.fwd) inner += '<div class="fwdl">↪ ' + tx("fwd_lbl") + "</div>";
    inner += quoteHtml(m);
    if (a && a.kind === "chat") {
      var u = fileUrl(a);
      if (a.type === "image") inner += '<img class="cimg" src="' + esc(u) + '" alt="" loading="lazy" data-act="viewimg" data-u="' + esc(u) + '">';
      else if (a.type === "voice") inner += '<div class="vox" data-id="' + m.id + '"><button type="button" class="vplay" data-act="play" data-id="' + m.id + '">▶</button><div class="vbar"><i></i></div><span class="vdur">' + mmss(a.dur || 0) + "</span></div>";
      else inner += '<a class="cfile" href="' + esc(u) + '" target="_blank" rel="noopener"><span class="fi">📄</span><span class="fn">' + esc(a.name || "file") + '</span><small>' + sizeTxt(a.size) + "</small></a>";
    } else if (a && a.kind === "sos") inner += '<div class="sysmsg">🆘 ' + tx("sys_sos") + "</div>";
    else if (a && a.kind === "edit") inner += '<div class="sysmsg">✏️ ' + tx("sys_edit") + "</div>";
    else if (a && a.kind === "reset") inner += '<div class="sysmsg">🔑 ' + tx("sys_reset") + "</div>";
    else if (a) inner += '<div class="sysmsg">📎 ' + esc(a.name || "") + "</div>";
    if (m.body && !(a && (a.kind === "sos") && /^🆘/.test(m.body))) inner += '<span class="mtxt">' + hlTxt(m.body) + "</span>";
    var tick = mine && !isGrp() ? '<span class="tick' + (m.seen ? " seen" : "") + '">' + (m.seen ? "✓✓" : "✓") + "</span>" : "";
    var head = "";
    if (m.staff && isGrp()) head = '<b class="who" style="color:' + gcol(m.who) + '">' + esc(peerName(m.who)) + "</b>";
    else if (m.staff && S.peer === "staff") head = '<b class="who">' + tx("chat_title") + "</b>";
    var cur = S.sr && S.cq && matchKeys()[S.sidx] === m.id;
    var chk = S.selmode ? '<span class="sck' + (S.ss[m.id] ? " on" : "") + '">✓</span>' : "";
    return '<div class="msg ' + (m.staff ? "staff" : "mine") + (S.ss[m.id] ? " sel" : "") + (cur ? " cur" : "") + (pop ? " pop" : "") + '" data-key="' + m.id + '" data-rid="' + m.rid + '">' + chk + head + inner + '<small><span>' + clockTxt(new Date(m.at).getTime()) + "</span>" + tick + "</small></div>";
  }
  function threadHtml() {
    var h = "", last = "";
    var cm = curMsgs(), mx = S.popAfter; cm.forEach(function (m) { var k = dayKey(m.at); if (k !== last) { last = k; h += '<div class="dsep"><span>' + dayLabel(k) + "</span></div>"; } h += bubble(m, m.id > S.popAfter); if (m.id > mx) mx = m.id; }); S.popAfter = mx;
    S.pend.forEach(function (p) { h += '<div class="msg mine pend"><span class="mtxt">⏳ ' + esc(p.label) + "</span></div>"; });
    return h || '<div class="empty">' + tx(isDm() || isGrp() ? "dm_hello" : "msg_none") + "</div>";
  }
  function voxRefresh() { Object.keys(AUD).forEach(function (k) { voxUpdate(+k); }); }
  function thrEnd() { var t = document.getElementById("thr"); if (t) t.scrollTop = t.scrollHeight; }
  function thrEndSoon() { thrEnd(); [60, 250, 700].forEach(function (ms) { setTimeout(function () { var t = document.getElementById("thr"); if (t && S.tab === "msgs" && !S.userScrolled) thrEnd(); }, ms); }); }
  function updCompose() {
    var w = document.getElementById("cmpw"); if (!w) return renderKeep();
    var old = document.getElementById("mt"), v = old ? old.value : "", had = document.activeElement === old; var th0 = document.getElementById("thr"), end0 = th0 ? th0.scrollTop + th0.clientHeight >= th0.scrollHeight - 40 : false;
    w.innerHTML = composeHtml(); var t = document.getElementById("mt"); if (t) { t.value = v; if (had) t.focus(); } chatToggle(); fixDigits(w); if (end0) thrEnd();
  }
  function updateThread() {
    var th = document.getElementById("thr"); if (!th) return;
    var near = th.scrollTop + th.clientHeight >= th.scrollHeight - 160, keep = th.scrollTop;
    th.innerHTML = threadHtml(); fixDigits(th); voxRefresh();
    if (near && !(S.sr && S.cq)) thrEnd(); else th.scrollTop = keep;
  }
  function replyBarHtml() { return S.rep ? '<div class="replybar"><div class="rq"><b>' + esc(S.rep.who) + "</b><span>" + esc(S.rep.txt) + '</span></div><button type="button" class="cbtn" data-act="repx">✕</button></div>' : ""; }
  function composeHtml() {
    if (!chatOpen() || S.gi) return "";
    if (S.selmode) { var kn = Object.keys(S.ss).length, dis = kn ? "" : " disabled"; return '<div class="compose selbar"><button type="button" class="sbtn" data-act="selfwd"' + dis + '>↪ ' + tx("fwd_b") + '</button><button type="button" class="sbtn" data-act="selcopy"' + dis + '>⧉ ' + tx("copy_b") + '</button><button type="button" class="sbtn dng" data-act="seldel"' + dis + '>🗑 ' + tx("delete_b") + "</button></div>"; }
    if (S.rec) return '<div class="compose rec"><button type="button" class="cbtn" data-act="recx" title="✕">🗑</button><span class="rdot"></span><b id="rt" class="ltr">' + mmss((Date.now() - S.rec.t0) / 1000) + '</b><span class="grow"></span><button type="button" class="cbtn send" data-act="recsend">➤</button></div>';
    return '<form class="compose" id="mf" autocomplete="off">' + replyBarHtml() + '<label class="cbtn" title="📎">📎<input type="file" id="cf" hidden accept="image/*,application/pdf,audio/*,video/mp4,.doc,.docx,.xls,.xlsx,.zip,.txt"></label><label class="cbtn" title="📷">📷<input type="file" id="cc" hidden accept="image/*" capture="environment"></label><textarea id="mt" rows="1" maxlength="1000" placeholder="' + esc(tx("msg_ph")) + '"></textarea><button type="submit" class="cbtn send" id="msend" hidden>➤</button><button type="button" class="cbtn mic" id="mmic" data-act="rec">🎙</button></form>';
  }
  function pickList() {
    var q = (S.pq || "").toLowerCase(), h = "";
    S.peers.forEach(function (p) { var n = (L === "fa" ? p.fa || p.en : p.en || p.fa) || ""; if (q && (p.fa + " " + p.en).toLowerCase().indexOf(q) < 0) return; h += '<button type="button" class="crow" data-act="openchat" data-p="' + esc(p.id) + '"><span class="av">' + esc(initials(n)) + '</span><span class="grow"><b>' + esc(n) + "</b></span></button>"; });
    return h || '<div class="empty">' + tx("dm_none") + "</div>";
  }
  /* ----- chat list ----- */
  function convList() {
    var by = {}, items = [];
    S.dm.forEach(function (m) { if (!by[m.peer]) by[m.peer] = []; by[m.peer].push(m); });
    Object.keys(by).forEach(function (id) { var l = lastOf(by[id]); items.push({ t: "dm", id: id, at: new Date(l.at).getTime(), last: l, u: unreadPeer(id) }); });
    S.grp.forEach(function (g) { items.push({ t: "g", id: "g:" + g.id, g: g, at: g.last ? new Date(g.last.at).getTime() : 0, u: g.unread || 0 }); });
    items.sort(function (a, b) { return b.at - a.at; });
    return items;
  }
  function gAvatar(g) { return '<span class="av gav">' + esc(initials(g.name)) + "</span>"; }
  function listSearchHtml() {
    var q = (S.lq || "").trim().toLowerCase(); if (!q) return "";
    var h = "", n = 0;
    function row(p, name, av, txt, key) { n++; h += '<button type="button" class="crow" data-act="openhit" data-p="' + esc(p) + '">' + av + '<span class="grow"><b>' + esc(name) + "</b><small>" + esc(txt) + "</small></span></button>"; }
    if ((tx("chat_title") + " staff").toLowerCase().indexOf(q) >= 0) row("staff", tx("chat_title"), '<span class="av logo"><img src="logo.png" alt=""></span>', tx("chat_sub"));
    S.grp.forEach(function (g) { if (g.name.toLowerCase().indexOf(q) >= 0) row("g:" + g.id, g.name, gAvatar(g), (g.members || []).length + " " + tx("g_members")); });
    S.peers.forEach(function (p) { var nm = (L === "fa" ? p.fa || p.en : p.en || p.fa) || ""; if ((p.fa + " " + p.en).toLowerCase().indexOf(q) >= 0) row(p.id, nm, '<span class="av">' + esc(initials(nm)) + "</span>", ""); });
    S.msgs.forEach(function (m) { if ((m.body || "").toLowerCase().indexOf(q) >= 0) row("staff", tx("chat_title"), '<span class="av logo"><img src="logo.png" alt=""></span>', m.body); });
    S.dm.forEach(function (m) { if ((m.body || "").toLowerCase().indexOf(q) >= 0) row(m.peer, peerName(m.peer), '<span class="av">' + esc(initials(peerName(m.peer))) + "</span>", m.body); });
    Object.keys(S.gm).forEach(function (k) { var g = grpById(+k); (S.gm[k] || []).forEach(function (m) { if (g && (m.body || "").toLowerCase().indexOf(q) >= 0) row("g:" + k, g.name, gAvatar(g), m.body); }); });
    return h || '<div class="empty">' + tx("no_match") + "</div>";
  }
  function listRows() {
    var lm = lastOf(S.msgs), nS = unreadStaff(), h = "";
    h += '<button type="button" class="crow pin" data-act="openchat" data-p="staff"><span class="av logo"><img src="logo.png" alt=""></span><span class="grow"><b>' + tx("chat_title") + '</b><small>' + esc(prevTxt(lm) || tx("chat_sub")) + '</small></span>' + (nS ? '<span class="cbadge">' + D(nS) + "</span>" : "") + "</button>";
    var items = convList();
    items.forEach(function (it) {
      if (it.t === "dm") { var l = it.last, n = peerName(it.id); h += '<button type="button" class="crow" data-act="openchat" data-p="' + esc(it.id) + '"><span class="av">' + esc(initials(n)) + '</span><span class="grow"><b>' + esc(n) + '</b><small>' + (l.mine ? "✓ " : "") + (l.fwd ? "↪ " : "") + esc(prevTxt(l)) + "</small></span>" + (it.u ? '<span class="cbadge">' + D(it.u) + "</span>" : "") + "</button>"; }
      else { var g = it.g, gl = g.last, pre = ""; if (gl && gl.kind === "msg") pre = (gl.mine ? tx("you") : peerName(gl.u)) + ": "; h += '<button type="button" class="crow" data-act="openchat" data-p="g:' + g.id + '">' + gAvatar(g) + '<span class="grow"><b>' + esc(g.name) + "</b><small>" + (gl && gl.kind === "created" ? esc(tx("g_created")) : esc(pre + prevTxt(gl))) + "</small></span>" + (it.u ? '<span class="cbadge">' + D(it.u) + "</span>" : "") + "</button>"; }
    });
    if (!items.length) h += '<div class="empty">' + tx("dm_empty") + "</div>";
    return h;
  }
  function listBodyHtml() { return (S.lq || "").trim() ? listSearchHtml() : listRows(); }
  function viewChatList() {
    var h = '<button type="button" class="sosrow" data-act="sos"><span class="sosb">SOS</span><span class="grow"><b>' + tx("sos_btn_t") + '</b><small>' + tx("sos_sub") + '</small></span></button><div class="h2 h2row"><span>' + tx("dm_title") + '</span><button type="button" class="linkb" data-act="clrall">🗑 ' + tx("clr_all_b") + '</button></div>';
    h += '<label class="fld lsearch"><input id="lq" type="search" autocomplete="off" placeholder="' + esc(tx("search_all")) + '" value="' + esc(S.lq || "") + '"></label>';
    return h + '<div class="clist" id="lres">' + listBodyHtml() + '</div><button type="button" class="fab" data-act="newmenu">' + ic("msgs") + "<span>" + tx("dm_new") + "</span></button>";
  }
  function viewPick() {
    return '<div class="chathead"><button type="button" class="backb" data-act="chatback" aria-label="' + tx("back") + '">' + (L === "fa" ? "→" : "←") + '</button><div><b>' + tx("dm_new") + '</b><small>' + tx("dm_sub") + '</small></div></div><label class="fld"><input id="pq" type="search" autocomplete="off" placeholder="' + esc(tx("dm_search")) + '" value="' + esc(S.pq || "") + '"></label><div class="clist" id="plist">' + pickList() + "</div>";
  }
  /* ----- group creation / members ----- */
  function gpickList() {
    var st = S.gadd || S.gnew; if (!st) return ""; var q = (st.q || "").toLowerCase(), h = "", have = {};
    if (S.gadd) { var g = grpById(gid()); if (g) g.members.forEach(function (m) { have[m.id] = 1; }); }
    S.peers.forEach(function (p) { if (have[p.id]) return; var n = (L === "fa" ? p.fa || p.en : p.en || p.fa) || ""; if (q && (p.fa + " " + p.en).toLowerCase().indexOf(q) < 0) return; h += '<button type="button" class="crow' + (st.sel[p.id] ? " on" : "") + '" data-act="gtog" data-p="' + esc(p.id) + '"><span class="av">' + esc(initials(n)) + '</span><span class="grow"><b>' + esc(n) + '</b></span><span class="sck' + (st.sel[p.id] ? " on" : "") + '">✓</span></button>'; });
    return h || '<div class="empty">' + tx("dm_none") + "</div>";
  }
  function gSelCount() { var st = S.gadd || S.gnew; return st ? Object.keys(st.sel).length : 0; }
  function viewGnew() {
    BAR = '<button type="button" class="btn pri" id="gcbtn" data-act="gcreate">' + tx("g_create") + " (" + D(gSelCount()) + ")</button>";
    return '<div class="chathead"><button type="button" class="backb" data-act="chatback" aria-label="' + tx("back") + '">' + (L === "fa" ? "→" : "←") + '</button><div><b>' + tx("new_group") + '</b><small>' + tx("g_pick") + '</small></div></div><label class="fld"><input id="gname" maxlength="60" autocomplete="off" placeholder="' + esc(tx("g_name_ph")) + '" value="' + esc(S.gnew.name || "") + '"></label><label class="fld"><input id="gq" type="search" autocomplete="off" placeholder="' + esc(tx("dm_search")) + '" value="' + esc(S.gnew.q || "") + '"></label><div class="clist" id="plist">' + gpickList() + "</div>";
  }
  function viewGadd() {
    BAR = '<button type="button" class="btn pri" id="gcbtn" data-act="gaddgo">' + tx("g_add") + " (" + D(gSelCount()) + ")</button>";
    return '<div class="chathead"><button type="button" class="backb" data-act="gaddback" aria-label="' + tx("back") + '">' + (L === "fa" ? "→" : "←") + '</button><div><b>' + tx("g_add") + '</b></div></div><label class="fld"><input id="gq" type="search" autocomplete="off" placeholder="' + esc(tx("dm_search")) + '" value="' + esc(S.gadd.q || "") + '"></label><div class="clist" id="plist">' + gpickList() + "</div>";
  }
  function viewGinfo() {
    var g = grpById(gid()); if (!g) return "";
    var h = '<div class="chathead"><button type="button" class="backb" data-act="ginfoback" aria-label="' + tx("back") + '">' + (L === "fa" ? "→" : "←") + "</button>" + gAvatar(g) + "<div><b>" + esc(g.name) + "</b><small>" + D(g.members.length) + " " + tx("g_members") + "</small></div></div>";
    if (g.admin) h += '<div class="card"><label class="fld"><span>' + tx("g_rename") + '</span><input id="grn" maxlength="60" value="' + esc(g.name) + '"></label><button type="button" class="btn pri" data-act="grename">' + tx("g_rename") + '</button></div><button type="button" class="btn" data-act="gadd">＋ ' + tx("g_add") + "</button>";
    h += '<div class="h2" style="margin-top:14px">' + tx("g_members") + '</div><div class="clist">';
    g.members.forEach(function (m) { var n = m.me ? tx("you") : peerName(m.id); h += '<div class="crow"><span class="av">' + esc(initials(n)) + '</span><span class="grow"><b>' + esc(n) + "</b>" + (m.admin ? "<small>" + tx("g_admin") + "</small>" : "") + "</span>" + (g.admin && !m.me ? '<button type="button" class="btn sm" data-act="grm" data-p="' + esc(m.id) + '">' + tx("g_remove") + "</button>" : "") + "</div>"; });
    return h + '</div><button type="button" class="btn danger" data-act="gleave" style="margin-top:14px">' + tx("g_leave") + "</button>";
  }
  function viewMsgs() {
    if (!S.peer) return viewChatList();
    if (S.peer === "pick") return viewPick();
    if (S.peer === "gnew") return viewGnew();
    if (isGrp() && S.gadd) return viewGadd();
    if (isGrp() && S.gi) return viewGinfo();
    var g = isGrp() ? grpById(gid()) : null;
    var nm = isGrp() ? (g ? g.name : "…") : S.peer === "staff" ? tx("chat_title") : peerName(S.peer), sb = isGrp() ? (g ? D(g.members.length) + " " + tx("g_members") : "") : '<span id="pst" class="pst">' + presTxt(!!S.pres[S.peer]) + "</span>";
    var av = isGrp() ? (g ? gAvatar(g) : "") : S.peer === "staff" ? '<img src="logo.png" alt="">' : '<span class="av">' + esc(initials(nm)) + "</span>";
    var head;
    if (S.selmode) { var ks = Object.keys(S.ss).length; head = '<div class="chathead selhead"><button type="button" class="backb" data-act="selx">✕</button><b class="grow">' + D(ks) + " " + tx("sel_n") + '</b><button type="button" class="selall" data-act="selall">' + tx("sel_all") + "</button></div>"; }
    else head = '<div class="chathead"><button type="button" class="backb backpill" data-act="chatback" aria-label="' + tx("back") + '"><span class="barr">' + (L === "fa" ? "→" : "←") + "</span><span>" + tx("back") + "</span></button>" + (isGrp() ? '<button type="button" class="ghd" data-act="ginfo">' + av + "<div><b>" + esc(nm) + "</b>" + (sb ? "<small>" + sb + "</small>" : "") + "</div></button>" : av + "<div><b>" + esc(nm) + "</b>" + (sb ? "<small>" + sb + "</small>" : "") + "</div>") + '<span class="grow"></span><button type="button" class="backb" data-act="sropen" title="' + esc(tx("search_ph")) + '">🔍</button>' + (isGrp() ? "" : '<button type="button" class="backb" data-act="clrask" data-p="' + esc(S.peer) + '" title="' + esc(tx("clr_b")) + '">🗑</button>') + "</div>";
    var sbar = S.sr ? '<div class="searchbar"><input id="cq" type="search" autocomplete="off" placeholder="' + esc(tx("search_ph")) + '" value="' + esc(S.cq || "") + '"><span id="cqn" class="cqn">' + srCount() + '</span><button type="button" class="backb" data-act="srprev">▲</button><button type="button" class="backb" data-act="srnext">▼</button><button type="button" class="backb" data-act="srclose">✕</button></div>' : "";
    return '<div class="chatwrap">' + head + sbar + '<div class="thread' + (S.selmode ? " selecting" : "") + '" id="thr">' + threadHtml() + '</div><div id="cmpw">' + composeHtml() + "</div></div>";
  }
  function srCount() { var mk = matchKeys(); return (S.cq || "").trim() ? (mk.length ? D(S.sidx + 1) + "/" + D(mk.length) : tx("no_match")) : ""; }
  function srJump() {
    var mk = matchKeys(), c = document.getElementById("cqn"); if (c) c.textContent = srCount();
    updateThread();
    var k = mk[S.sidx]; if (k) { var el = document.querySelector('#thr .msg[data-key="' + k + '"]'); if (el) el.scrollIntoView({ block: "center" }); }
  }
  /* ----- actions ----- */
  function renderKeep() { S.noscroll = true; render(); }
  function copyText(t) { try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t); return true; } } catch (e) { /* fall through */ } var ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand("copy"); } catch (e2) { ok = false; } document.body.removeChild(ta); return ok; }
  function doReply(k) { var m = msgByKey(k); if (!m || !selectable(m)) return; S.rep = { rid: m.rid, who: senderLabel(m), txt: prevTxt(m) }; var viaMenu = !!S.menu; S.menu = 0; if (viaMenu) renderKeep(); else updCompose(); var t = document.getElementById("mt"); if (t) { try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } } }
  function doFwd(keys) { var items = keys.map(msgByKey).filter(function (m) { return m && selectable(m); }); if (!items.length) return; S.fw = { items: items.slice(0, 25), q: "" }; S.menu = 0; renderKeep(); }
  function openMenu(k) { if (S.menu === k || S.selmode) return; S.menu = k; renderKeep(); }
  function askDelete(keys) {
    var list = keys.map(msgByKey).filter(function (m) { return m && canDel(m); }); if (!list.length) return toast(tx("cant_del"));
    S.dlg = { t: tx("del_q"), act: "delgo", keys: list.map(function (m) { return m.id; }) }; S.menu = 0; renderKeep();
  }
  function delMsgs(keys) {
    var ids = keys.map(function (k) { var m = msgByKey(k); return m ? m.rid : 0; }).filter(Boolean), p;
    if (isGrp()) p = authed("jumper_group_delete_msgs", { p_gid: gid(), p_ids: ids }).then(function () { return refreshGroupMsgs(gid()); }).then(refreshGroups);
    else if (isDm()) p = authed("jumper_dm_delete_many", { p_ids: ids }).then(function () { return refreshDm(); });
    else p = authed("jumper_delete_msgs", { p_ids: ids }).then(function () { return refreshMsgs(); });
    return p.then(function () { S.selmode = false; S.ss = {}; S.menu = 0; S.dlg = null; renderKeep(); }).catch(function () { S.dlg = null; renderKeep(); toast(tx("fail")); });
  }
  function fwdSend(target) {
    var fw = S.fw; if (!fw) return; S.fw = null; renderKeep();
    var chain = Promise.resolve();
    fw.items.forEach(function (m) { chain = chain.then(function () { return sendTo(target, m.body || "", m.attach && m.attach.kind === "chat" ? m.attach : null, null, true); }); });
    chain.then(function () { S.selmode = false; S.ss = {}; toast(tx("fwd_done")); if (S.tab === "msgs" && chatOpen()) updateThread(); }).catch(function () { toast(tx("fail")); });
  }
  function fwdTargets() {
    var q = ((S.fw && S.fw.q) || "").toLowerCase(), h = "";
    function row(t, name, av, sub) { if (q && name.toLowerCase().indexOf(q) < 0) return; h += '<button type="button" class="crow" data-act="fwdto" data-t="' + esc(t) + '">' + av + '<span class="grow"><b>' + esc(name) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</span></button>"; }
    row("staff", tx("chat_title"), '<span class="av logo"><img src="logo.png" alt=""></span>', tx("chat_sub"));
    S.grp.forEach(function (g) { row("g:" + g.id, g.name, gAvatar(g), g.members.length + " " + tx("g_members")); });
    S.peers.forEach(function (p) { var nm = (L === "fa" ? p.fa || p.en : p.en || p.fa) || ""; row(p.id, nm, '<span class="av">' + esc(initials(nm)) + "</span>", ""); });
    return h || '<div class="empty">' + tx("dm_none") + "</div>";
  }
  function chatModals() {
    var h = "";
    if (S.menu) {
      var m = msgByKey(S.menu);
      if (m) {
        h += '<div class="modal" data-act="menux"><div class="sheet msheet"><div class="mprev">' + esc(prevTxt(m)) + "</div>" +
          (selectable(m) ? '<button type="button" class="mopt" data-act="mreply">↩ ' + tx("reply_b") + '</button><button type="button" class="mopt" data-act="mfwd">↪ ' + tx("fwd_b") + "</button>" : "") +
          (m.body ? '<button type="button" class="mopt" data-act="mcopy">⧉ ' + tx("copy_b") + "</button>" : "") +
          (selectable(m) ? '<button type="button" class="mopt" data-act="msel">☑ ' + tx("select_b") + "</button>" : "") +
          (canDel(m) ? '<button type="button" class="mopt danger" data-act="mdel">🗑 ' + tx("delete_b") + "</button>" : "") + "</div></div>";
      }
    }
    if (S.fw) h += '<div class="modal" data-act="fwdx"><div class="sheet"><div class="h2">' + tx("fwd_to") + ' (' + D(S.fw.items.length) + ')</div><label class="fld"><input id="fq" type="search" autocomplete="off" placeholder="' + esc(tx("dm_search")) + '" value="' + esc(S.fw.q || "") + '"></label><div class="clist" id="fwl">' + fwdTargets() + '</div><button type="button" class="btn" data-act="fwdx" style="margin-top:10px">' + tx("c2_cancel") + "</button></div></div>";
    if (S.nm) h += '<div class="modal" data-act="nmx"><div class="sheet msheet"><button type="button" class="mopt" data-act="openchat" data-p="pick">💬 ' + tx("new_chat") + '</button><button type="button" class="mopt" data-act="openchat" data-p="gnew">👥 ' + tx("new_group") + "</button></div></div>";
    if (S.dlg) h += '<div class="modal" data-act="dlgx"><div class="sheet msheet"><div class="mprev">' + esc(S.dlg.t) + '</div><div class="row2"><button type="button" class="btn" data-act="dlgx">' + tx("c2_cancel") + '</button><button type="button" class="btn danger" data-act="dlgok">' + tx("c2_ok") + "</button></div></div></div>";
    return h;
  }
  /* ----- gestures: swipe left = reply, swipe right = forward, long press / right click = menu ----- */
  var G = { el: null, x: 0, y: 0, dx: 0, drag: false, lp: 0, cap: 0 };
  function gReset() { clearTimeout(G.lp); if (G.el) { G.el.style.transition = "transform .18s"; G.el.style.transform = ""; G.el.removeAttribute("data-sw"); var e = G.el; setTimeout(function () { e.style.transition = ""; }, 200); } G.el = null; G.drag = false; }
  document.addEventListener("pointerdown", function (ev) {
    var el = ev.target.closest ? ev.target.closest("#thr .msg[data-key]") : null; if (!el || (ev.pointerType === "mouse" && ev.button !== 0)) return;
    if (S.selmode) return;
    G.el = el; G.x = ev.clientX; G.y = ev.clientY; G.dx = 0; G.drag = false; G.cap = ev.pointerId; clearTimeout(G.lp);
    G.lp = setTimeout(function () { if (G.el === el && !G.drag) { var k = +el.dataset.key; G.el = null; openMenu(k); } }, 480);
  });
  document.addEventListener("pointermove", function (ev) {
    if (!G.el) return; var dx = ev.clientX - G.x, dy = ev.clientY - G.y;
    if (!G.drag) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { gReset(); return; }
      if (Math.abs(dx) > 14 && Math.abs(dx) > Math.abs(dy)) { G.drag = true; clearTimeout(G.lp); }
      else { if (Math.abs(dx) + Math.abs(dy) > 8) clearTimeout(G.lp); return; }
    }
    G.dx = Math.max(-96, Math.min(96, dx)); G.el.style.transform = "translateX(" + G.dx + "px)"; G.el.setAttribute("data-sw", G.dx <= -60 ? "reply" : G.dx >= 60 ? "fwd" : "");
  });
  function gEnd() { clearTimeout(G.lp); if (!G.el) return; var d = G.dx, k = +G.el.dataset.key, was = G.drag; gReset(); if (was) { if (d <= -60) doReply(k); else if (d >= 60) doFwd([k]); } }
  document.addEventListener("scroll", function (ev) { var t = ev.target; if (t && t.id === "thr") { S.userScrolled = t.scrollTop + t.clientHeight < t.scrollHeight - 120; } }, true);
  document.addEventListener("pointerup", gEnd); document.addEventListener("pointercancel", function () { gReset(); });
  document.addEventListener("contextmenu", function (ev) { var el = ev.target.closest ? ev.target.closest("#thr .msg[data-key]") : null; if (!el) return; ev.preventDefault(); gReset(); openMenu(+el.dataset.key); });
  /* ---------- chat v2 actions ---------- */
  function selKeys() { return Object.keys(S.ss).map(Number).sort(function (a, b) { return a - b; }); }
  function leaveGroup() {
    var g = grpById(gid()); if (!g) return; var me = null; g.members.forEach(function (m) { if (m.me) me = m.id; }); if (!me) return;
    authed("jumper_group_remove", { p_gid: g.id, p_member: me }).then(function () { return refreshGroups(); }).then(function () { S.peer = ""; S.gi = false; S.dlg = null; S.anim = true; render(); toTop(); }).catch(function () { S.dlg = null; renderKeep(); toast(tx("fail")); });
  }
  function clearChat(peer) {
    var ps = [];
    if (peer === "*") { ps.push(authed("jumper_messages_clear")); ps.push(authed("jumper_dm_clear_all")); }
    else if (peer === "staff") ps.push(authed("jumper_messages_clear"));
    else if (peer && peer.indexOf("g:") !== 0) ps.push(authed("jumper_dm_clear", { p_peer: peer }));
    Promise.all(ps).then(function () { return Promise.all([refreshMsgs(), refreshDm()]); }).then(function () { S.selmode = false; S.ss = {}; S.dlg = null; renderKeep(); toast(tx("clr_done")); }).catch(function () { S.dlg = null; renderKeep(); toast(tx("fail")); });
  }
  /* long press on a chat row = clear history */
  var LPR = { t: 0, fired: 0 };
  document.addEventListener("pointerdown", function (ev) {
    var row = ev.target.closest ? ev.target.closest("#lres .crow[data-p]") : null; if (!row || (ev.pointerType === "mouse" && ev.button !== 0)) return;
    var p = row.dataset.p; if (!p || p.indexOf("g:") === 0) return; clearTimeout(LPR.t); LPR.x = ev.clientX; LPR.y = ev.clientY;
    LPR.t = setTimeout(function () { LPR.fired = Date.now(); S.dlg = { t: tx("clr_q"), act: "clrgo", peer: p }; renderKeep(); }, 550);
  });
  document.addEventListener("pointermove", function (ev) { if (LPR.t && (Math.abs(ev.clientX - LPR.x) > 8 || Math.abs(ev.clientY - LPR.y) > 8)) { clearTimeout(LPR.t); LPR.t = 0; } });
  ["pointerup", "pointercancel"].forEach(function (n) { document.addEventListener(n, function () { clearTimeout(LPR.t); LPR.t = 0; }); });
  document.addEventListener("contextmenu", function (ev) { if (ev.target.closest && ev.target.closest("#lres .crow[data-p]")) ev.preventDefault(); });
  document.addEventListener("click", function (ev) { if (Date.now() - LPR.fired < 700 && ev.target.closest && ev.target.closest("#lres .crow")) { ev.stopPropagation(); ev.preventDefault(); } }, true);
  function chatAct(a, t, ev) {
    var bk = ev.target === t || t.tagName === "BUTTON";
    switch (a) {
      case "chatback": S.peer = ""; S.anim = true; S.rep = null; S.selmode = false; S.ss = {}; S.cq = ""; S.sr = false; S.gi = false; S.gadd = null; S.gnew = null; S.lq = ""; render(); toTop(); return true;
      case "newmenu": S.nm = true; renderKeep(); return true;
      case "nmx": if (ev.target === t) { S.nm = false; renderKeep(); } return true;
      case "menux": if (ev.target === t) { S.menu = 0; renderKeep(); } return true;
      case "mreply": doReply(S.menu); return true;
      case "mfwd": doFwd([S.menu]); return true;
      case "mcopy": { var m = msgByKey(S.menu); if (m && m.body) { copyText(m.body); toast(tx("copied")); } S.menu = 0; renderKeep(); return true; }
      case "mdel": askDelete([S.menu]); return true;
      case "msel": S.selmode = true; S.ss = {}; S.ss[S.menu] = true; S.menu = 0; renderKeep(); return true;
      case "selall": { var all = curMsgs().filter(selectable); var full = all.length && all.every(function (m) { return S.ss[m.id]; }); S.ss = {}; if (!full) all.forEach(function (m) { S.ss[m.id] = true; }); renderKeep(); return true; }
      case "clrask": S.dlg = { t: tx("clr_q"), act: "clrgo", peer: t.dataset.p || S.peer }; renderKeep(); return true;
      case "clrall": S.dlg = { t: tx("clr_all_q"), act: "clrgo", peer: "*" }; renderKeep(); return true;
      case "selx": S.selmode = false; S.ss = {}; renderKeep(); return true;
      case "selfwd": doFwd(selKeys()); return true;
      case "selcopy": { var txt = selKeys().map(msgByKey).filter(Boolean).map(function (x) { return x.body || ""; }).filter(Boolean).join("\n"); if (txt) { copyText(txt); toast(tx("copied")); } return true; }
      case "seldel": askDelete(selKeys()); return true;
      case "fwdx": if (bk) { S.fw = null; renderKeep(); } return true;
      case "fwdto": fwdSend(t.dataset.t); return true;
      case "dlgx": if (bk) { S.dlg = null; renderKeep(); } return true;
      case "dlgok": { var d = S.dlg; if (!d) return true; if (d.act === "delgo") delMsgs(d.keys); else if (d.act === "clrgo") clearChat(d.peer); else if (d.act === "gleave") leaveGroup(); return true; }
      case "repx": S.rep = null; updCompose(); return true;
      case "gotomsg": { var el = document.querySelector('#thr .msg[data-rid="' + t.dataset.rid + '"]'); if (el) { el.scrollIntoView({ block: "center", behavior: "smooth" }); el.classList.add("flash"); setTimeout(function () { el.classList.remove("flash"); }, 1400); } return true; }
      case "sropen": S.sr = true; S.cq = ""; S.sidx = 0; renderKeep(); setTimeout(function () { var i = document.getElementById("cq"); if (i) i.focus(); }, 30); return true;
      case "srclose": S.sr = false; S.cq = ""; renderKeep(); return true;
      case "srprev": case "srnext": { var mk = matchKeys(); if (mk.length) { S.sidx = (S.sidx + (a === "srprev" ? -1 : 1) + mk.length) % mk.length; srJump(); } return true; }
      case "openhit": { var q = S.lq; S.lq = ""; openChat(t.dataset.p); S.cq = q; S.sr = true; var mk2 = matchKeys(); S.sidx = Math.max(0, mk2.length - 1); S.stick = false; S.noscroll = true; render(); setTimeout(srJump, 60); return true; }
      case "ginfo": S.gi = true; render(); toTop(); return true;
      case "ginfoback": S.gi = false; render(); return true;
      case "gadd": S.gadd = { sel: {}, q: "" }; render(); toTop(); return true;
      case "gaddback": S.gadd = null; render(); return true;
      case "gtog": { var st = S.gadd || S.gnew; if (!st) return true; var id = t.dataset.p; if (st.sel[id]) delete st.sel[id]; else st.sel[id] = 1; var l = document.getElementById("plist"); if (l) l.innerHTML = gpickList(); var cb = document.getElementById("gcbtn"); if (cb) cb.textContent = (S.gadd ? tx("g_add") : tx("g_create")) + " (" + D(gSelCount()) + ")"; return true; }
      case "gcreate": {
        var nm = (document.getElementById("gname") ? document.getElementById("gname").value : S.gnew.name || "").trim(), ms = Object.keys(S.gnew.sel);
        if (!nm || !ms.length) return toast(tx("g_need")), true;
        authed("jumper_group_create", { p_name: nm, p_members: ms }).then(function (id) { return refreshGroups().then(function () { openChat("g:" + id); }); }).catch(function () { toast(tx("fail")); }); return true;
      }
      case "gaddgo": { var ms2 = Object.keys(S.gadd.sel); if (!ms2.length) return true; authed("jumper_group_add", { p_gid: gid(), p_members: ms2 }).then(function () { return refreshGroups(); }).then(function () { S.gadd = null; render(); }).catch(function () { toast(tx("fail")); }); return true; }
      case "grename": { var gi = document.getElementById("grn"); if (gi && gi.value.trim()) authed("jumper_group_rename", { p_gid: gid(), p_name: gi.value.trim() }).then(function () { return refreshGroups(); }).then(function () { render(); }).catch(function () { toast(tx("fail")); }); return true; }
      case "grm": authed("jumper_group_remove", { p_gid: gid(), p_member: t.dataset.p }).then(function () { return refreshGroups(); }).then(function () { render(); }).catch(function () { toast(tx("fail")); }); return true;
      case "gleave": S.dlg = { t: tx("g_leave_q"), act: "gleave" }; renderKeep(); return true;
    }
    return false;
  }
  document.addEventListener("click", function (ev) {
    if (!S.selmode) return; var el = ev.target.closest ? ev.target.closest("#thr .msg[data-key]") : null; if (!el) return;
    var k = +el.dataset.key, m = msgByKey(k); if (!m || !selectable(m)) return;
    if (S.ss[k]) delete S.ss[k]; else S.ss[k] = 1; if (!Object.keys(S.ss).length) S.selmode = false; renderKeep();
  });
  document.addEventListener("input", function (ev) {
    var i = ev.target; if (!i || !i.id) return;
    if (i.id === "lq") { S.lq = i.value; var l = document.getElementById("lres"); if (l) l.innerHTML = listBodyHtml(); }
    else if (i.id === "cq") { S.cq = i.value; S.sidx = Math.max(0, matchKeys().length - 1); srJump(); }
    else if (i.id === "gname" && S.gnew) S.gnew.name = i.value;
    else if (i.id === "gq") { var st = S.gadd || S.gnew; if (st) { st.q = i.value; var pl = document.getElementById("plist"); if (pl) pl.innerHTML = gpickList(); } }
    else if (i.id === "fq" && S.fw) { S.fw.q = i.value; var fl = document.getElementById("fwl"); if (fl) fl.innerHTML = fwdTargets(); }
  });
  document.addEventListener("keydown", function (ev) { if (ev.target && ev.target.id === "cq" && ev.key === "Enter") { ev.preventDefault(); var mk = matchKeys(); if (mk.length) { S.sidx = (S.sidx + (ev.shiftKey ? -1 : 1) + mk.length) % mk.length; srJump(); } } });
  function chatToggle() { var t = document.getElementById("mt"), s = document.getElementById("msend"), m = document.getElementById("mmic"); if (!t || !s || !m) return; var has = !!t.value.trim(); s.hidden = !has; m.hidden = has; t.style.height = "auto"; t.style.height = Math.min(120, Math.max(48, t.scrollHeight)) + "px"; }
  function voxUpdate(id) {
    var a = AUD[id], el = document.querySelector('.vox[data-id="' + id + '"]'); if (!el || !a) return;
    var m = curMsgs().filter(function (x) { return x.id === id; })[0], d = a.duration && isFinite(a.duration) ? a.duration : (m && m.attach && m.attach.dur) || 0;
    el.querySelector(".vplay").textContent = a.paused ? "▶" : "⏸";
    el.querySelector("i").style.width = d ? Math.min(100, a.currentTime / d * 100) + "%" : "0";
    el.querySelector(".vdur").textContent = mmss(a.paused && a.currentTime === 0 ? d : a.currentTime);
  }
  function playVoice(id) {
    var m = curMsgs().filter(function (x) { return x.id === id; })[0]; if (!m || !m.attach) return;
    Object.keys(AUD).forEach(function (k) { if (+k !== id) AUD[k].pause(); });
    var a = AUD[id];
    if (!a) { a = new Audio(fileUrl(m.attach)); a.preload = "auto"; AUD[id] = a; ["timeupdate", "pause", "play", "loadedmetadata"].forEach(function (e) { a.addEventListener(e, function () { voxUpdate(id); }); }); a.addEventListener("ended", function () { a.currentTime = 0; voxUpdate(id); }); }
    if (a.paused) a.play().catch(function () { toast(tx("fail")); }); else a.pause();
  }
  function shrinkImage(file) {
    return new Promise(function (res) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return res({ blob: file });
      var url = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var k = Math.min(1, 1600 / Math.max(im.width, im.height)); URL.revokeObjectURL(url);
        if (k === 1 && file.size < 700000) return res({ blob: file, w: im.width, h: im.height });
        var c = document.createElement("canvas"); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        c.toBlob(function (b) { res(b ? { blob: b, w: c.width, h: c.height, type: "image/jpeg" } : { blob: file }); }, "image/jpeg", 0.82);
      };
      im.onerror = function () { URL.revokeObjectURL(url); res({ blob: file }); };
      im.src = url;
    });
  }
  function randId() { var a = new Uint8Array(12); (window.crypto || window.msCrypto).getRandomValues(a); return Array.prototype.map.call(a, function (b) { return (b < 16 ? "0" : "") + b.toString(16); }).join(""); }
  /* Uploads a file / photo / voice note and sends it as a chat message. */
  function chatSend(file, opt) {
    opt = opt || {}; var type = opt.type || (/^image\//.test(file.type) ? "image" : "file");
    var ctype = String(opt.mime || file.type || "").split(";")[0];
    if (!OKTYPE.test(ctype)) return toast(tx("badtype"));
    if (file.size > 15 * 1048576) return toast(tx("big15"));
    var tmp = { label: type === "voice" ? tx("voice_lbl") : type === "image" ? tx("photo_lbl") : (opt.name || file.name || "file") }; S.pend.push(tmp); updateThread();
    var done = function () { S.pend = S.pend.filter(function (x) { return x !== tmp; }); };
    (type === "image" ? shrinkImage(file) : Promise.resolve({ blob: file })).then(function (r) {
      var blob = r.blob, mime = r.type || ctype, name = opt.name || file.name || "file";
      var safe = String(name).replace(/[^A-Za-z0-9._-]/g, "_").slice(-50) || "file";
      var path = "jumper/" + S.sess.username + "/" + randId() + "-" + safe;
      return fetch(CFG.url + "/storage/v1/object/chat-files/" + path, { method: "POST", headers: hdr({ "Content-Type": mime, "x-upsert": "false" }), body: blob }).then(function (up) {
        if (!up.ok) throw new Error("up");
        var at = { kind: "chat", type: type, path: path, name: name, mime: mime, size: blob.size }; if (opt.dur) at.dur = opt.dur; if (r.w) { at.w = r.w; at.h = r.h; }
        return chatPost("", at);
      });
    }).then(function () { done(); updateThread(); }).catch(function () { done(); updateThread(); toast(tx("fail")); });
  }
  function recTick() { var el = document.getElementById("rt"); if (S.rec && el) el.textContent = mmss((Date.now() - S.rec.t0) / 1000); if (S.rec && Date.now() - S.rec.t0 > 300000) recStop(true); }
  function recStart() {
    if (!navigator.mediaDevices || !window.MediaRecorder) return toast(tx("rec_no"));
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      var mt = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"].filter(function (t) { try { return MediaRecorder.isTypeSupported(t); } catch (e) { return false; } })[0] || "";
      var mr = mt ? new MediaRecorder(stream, { mimeType: mt }) : new MediaRecorder(stream), chunks = [];
      mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      var rec = { mr: mr, stream: stream, chunks: chunks, t0: Date.now(), mime: mr.mimeType || mt || "audio/webm", send: false };
      mr.onstop = function () {
        stream.getTracks().forEach(function (t) { t.stop(); }); clearInterval(recTimer);
        if (S.rec === rec) S.rec = null; render();
        var dur = (Date.now() - rec.t0) / 1000;
        if (rec.send && chunks.length && dur >= 0.8) {
          var type = String(rec.mime).split(";")[0], blob = new Blob(chunks, { type: type });
          chatSend(blob, { type: "voice", dur: Math.round(dur), mime: type, name: "voice." + (/mp4/.test(type) ? "m4a" : /ogg/.test(type) ? "ogg" : "webm") });
        }
      };
      S.rec = rec; mr.start(); render(); recTimer = setInterval(recTick, 250);
    }).catch(function () { toast(tx("rec_deny")); });
  }
  function recStop(send) { var r = S.rec; if (!r) return; r.send = !!send; try { r.mr.stop(); } catch (e) { S.rec = null; render(); } }
  function kv(rows) { return '<div class="card"><div class="kv">' + rows.filter(function (r) { return r; }).map(function (r) { return "<div><span>" + tx(r[0]) + "</span><span>" + esc(D(r[1] === 0 ? "0" : (r[1] || "—"))) + "</span></div>"; }).join("") + "</div></div>"; }
  function yn(v) { return v ? tx("yes") : tx("no"); }

  var ICN = {
    loads: '<path d="M3 10.500a9 9 0 0 1 18 0c-1.500-1.200-3-1.200-4.500 0-1.500-1.200-3-1.200-4.500 0-1.500-1.200-3-1.200-4.500 0C6 9.300 4.500 9.300 3 10.500z"/><path d="M3 10.500l8 7.500M21 10.500l-8 7.500M12 10.500v7.500"/><circle cx="12" cy="19.800" r="1.700" fill="currentColor"/>',
    cal: '<rect x="3.500" y="5" width="17" height="15.500" rx="2.500"/><path d="M3.500 10h17M8 3v4M16 3v4"/>', drop: '<path d="M12 3.500s6 6.200 6 10.500a6 6 0 0 1-12 0C6 9.700 12 3.500 12 3.500z"/>', gauge: '<path d="M4 17a8.500 8.500 0 1 1 16 0"/><path d="M12 17l4-5"/>', layers: '<path d="M12 4l9 5-9 5-9-5z"/><path d="M3 14l9 5 9-5"/>', rain: '<path d="M7 15a4 4 0 0 1-.6-8A6 6 0 0 1 18 8.500 3.500 3.500 0 0 1 17 15z"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>',
    book: '<path d="M5 4.500A1.500 1.500 0 0 1 6.500 3H19v16H6.500A1.500 1.500 0 0 0 5 20.500z"/><path d="M5 20.500A1.500 1.500 0 0 0 6.500 22H19v-3M9 8h6M9 12h6"/>',
    gear: '<circle cx="12" cy="12" r="3.200"/><path d="M12 2.500v3M12 18.500v3M2.500 12h3M18.500 12h3M5.300 5.300l2.100 2.100M16.600 16.600l2.100 2.100M5.300 18.700l2.100-2.100M16.600 7.400l2.100-2.100"/>',
    alerts: '<path d="M6 9a6 6 0 0 1 12 0c0 6 2.2 7 2.2 7H3.8S6 15 6 9z"/><path d="M10 20a2 2 0 0 0 4 0"/><path d="M4 4.5C3 6 2.7 7 2.6 8M20 4.5c1 1.5 1.3 2.5 1.4 3.5" />',
    msgs: '<path d="M4 4.5h16a1 1 0 0 1 1 1v10.5a1 1 0 0 1-1 1h-9.5L5.5 21v-4H4a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1z"/><circle cx="8.5" cy="10.8" r=".9" fill="currentColor"/><circle cx="12" cy="10.8" r=".9" fill="currentColor"/><circle cx="15.5" cy="10.8" r=".9" fill="currentColor"/>',
    me: '<path d="M5 13a7 7 0 0 1 14 0v2H5z"/><path d="M5 15v1.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V15"/><path d="M8.5 13h7"/><path d="M12 6V4"/>',
    logout: '<path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9"/><path d="M15.5 8l4 4-4 4M19.5 12H9"/>',
    f_profile: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><circle cx="8.5" cy="11" r="2"/><path d="M5.5 16c.6-1.6 1.8-2.3 3-2.3s2.4.7 3 2.3M14 10h4.5M14 13.5h3"/>',
    f_cred: '<path d="M12 3l2.4 5 5.4.7-4 3.8 1 5.4-4.8-2.6-4.8 2.6 1-5.4-4-3.8L9.6 8z"/>',
    f_rig: '<path d="M8.5 7V5.5a3.5 3.5 0 0 1 7 0V7"/><rect x="5.5" y="7" width="13" height="13.5" rx="3"/><path d="M9 12.5h6M9 16h6"/>',
    f_med: '<path d="M12 20.5S4 15.8 4 10a4.3 4.3 0 0 1 8-2.2A4.3 4.3 0 0 1 20 10c0 5.800-8 10.500-8 10.500z"/><path d="M12 9v5M9.500 11.500h5"/>',
    f_emg: '<path d="M5.500 3.500h3.200l1.800 4.500-2.200 1.400a10 10 0 0 0 5.200 5.200l1.400-2.200 4.500 1.800v3.200a2 2 0 0 1-2 2A15.500 15.500 0 0 1 3.500 5.500a2 2 0 0 1 2-2z"/>',
    f_docs: '<path d="M3.500 7.500a2 2 0 0 1 2-2h4l2 2.200h7a2 2 0 0 1 2 2v7.800a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
    f_log: '<path d="M6 3.500h11a2 2 0 0 1 2 2V20H8a2 2 0 0 1-2-2z"/><path d="M6 18a2 2 0 0 1 2-2h11M10 8h5M10 11.500h5"/>',
    f_pw: '<circle cx="8" cy="15" r="4"/><path d="M11 12l8.500-8.500M16.500 6.500l2.500 2.500M14 9l2 2"/>',
    wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>', eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', cloud: '<path d="M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 9.500 4 4 0 0 1 17 18z"/>', compass: '<circle cx="12" cy="12" r="9"/><path d="M15.500 8.500l-2 5-5 2 2-5z"/>', temp: '<path d="M10 14.500V5a2 2 0 0 1 4 0v9.500a4 4 0 1 1-4 0z"/>', user: '<circle cx="12" cy="8.500" r="3.800"/><path d="M4.500 20.500c.8-4 4-5.800 7.500-5.800s6.700 1.800 7.500 5.800"/>',
    send: '<path d="M4 12l16-8-6 16-3-6.500z"/>'
  };
  function ic(n, c) { return '<svg class="ico ' + (c || "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICN[n] || "") + "</svg>"; }
  var FOLDERS = [["f_profile", "f_profile", "var(--orange)"], ["f_cred", "f_cred", "var(--olive)"], ["f_rig", "f_rig", "var(--sky)"], ["f_med", "f_med", "var(--coral)"], ["f_emg", "f_emg", "var(--amber)"], ["f_docs", "f_docs", "var(--teal)"]];

  /* ---------- editing (jumper edits, confirms, staff applies) ---------- */
  var SNAKE = { phone: "phone", email: "email", heightCm: "height_cm", weightKg: "weight_kg", organization: "organization", licenseType: "license_type", licenseNumber: "license_number", membershipExpiry: "membership_expiry", firstJumpDate: "first_jump_date", rigOwnership: "rig_ownership", rigType: "rig_type", mainModel: "main_model", mainSize: "main_size", reserveRepackDate: "reserve_repack_date", emergencyPhone: "emergency_phone", emergencyRelation: "emergency_relation" };
  function T3(arr) { return arr.map(function (x) { return typeof x === "string" ? [x, x, x] : x; }); }
  var OPT = {
    blood: T3(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ["Unknown", "نامشخص", "Unknown"]]),
    gender: [["Male", "مرد", "Male"], ["Female", "زن", "Female"], ["Other", "سایر", "Other"]],
    org: [["USPA", "USPA (آمریکا)", "USPA"], ["BPA", "BPA (بریتانیا)", "BPA"], ["FAI", "FAI (فدراسیون جهانی هوانوردی)", "FAI"], ["PASA (South Africa)", "PASA (آفریقای جنوبی)", "PASA (South Africa)"], ["CSPA (Canada)", "CSPA (کانادا)", "CSPA (Canada)"], ["APF (Australia)", "APF (استرالیا)", "APF (Australia)"], ["Iran Air Sports Federation", "فدراسیون ورزش‌های هوایی ایران", "Iran Air Sports Federation"], ["Iran Civil Aviation Organization", "سازمان هواپیمایی کشوری ایران", "Iran Civil Aviation Organization"], ["Other", "سایر", "Other"]],
    lic: [["None", "ندارد", "None"], ["A", "گواهی A", "A"], ["B", "گواهی B", "B"], ["C", "گواهی C", "C"], ["D", "گواهی D", "D"], ["E", "گواهی E", "E"]],
    rigown: [["Own", "شخصی", "Own"], ["Rental", "کرایه‌ای", "Rental"]],
    rig: [["Vector 3", "وکتور ۳ (Vector 3)", "Vector 3"], ["Javelin", "جاولین (Javelin)", "Javelin"], ["Icon A5", "آیکون A5 (Icon A5)", "Icon A5"], ["Mirage", "میراژ (Mirage)", "Mirage"], ["Wings", "وینگز (Wings)", "Wings"], ["Infinity", "اینفینیتی (Infinity)", "Infinity"], ["SWS", "SWS", "SWS"], ["Parachute de France", "پاراشوت دو فرانس", "Parachute de France"], ["ParAAvis", "پاراویس (ParAAvis)", "ParAAvis"], ["Other", "سایر", "Other"]],
    med: [["FAA Medical", "مدیکال FAA", "FAA Medical"], ["Iran CAO Medical", "مدیکال سازمان هواپیمایی ایران", "Iran CAO Medical"], ["Medical Certificate", "گواهی پزشکی", "Medical Certificate"], ["Pre-Jump Medical Screening", "معاینهٔ پزشکی پیش از پرش", "Pre-Jump Medical Screening"], ["Self-Declaration", "اظهار شخصی", "Self-Declaration"], ["Other", "سایر", "Other"]],
    rel: [["Father", "پدر", "Father"], ["Mother", "مادر", "Mother"], ["Brother", "برادر", "Brother"], ["Sister", "خواهر", "Sister"], ["Wife", "همسر", "Wife"], ["Husband", "همسر", "Husband"], ["Friend", "دوست", "Friend"], ["Other", "سایر", "Other"]]
  };
  var EDIT = {
    f_profile: [["firstNameFa", "k_first_fa", "text"], ["lastNameFa", "k_last_fa", "text"], ["fatherNameFa", "k_father_fa", "text"], ["firstNameEn", "k_first_en", "text", null, "ltr"], ["lastNameEn", "k_last_en", "text", null, "ltr"], ["fatherNameEn", "k_father_en", "text", null, "ltr"], ["birthDate", "k_birth", "date"], ["bloodType", "k_blood", "select", "blood"], ["gender", "k_gender", "select", "gender"], ["phone", "k_phone", "tel"], ["email", "k_email", "email"], ["heightCm", "k_h", "num"], ["weightKg", "k_w", "num"]],
    f_cred: [["organization", "k_org", "select", "org"], ["licenseType", "k_ltype", "select", "lic"], ["licenseNumber", "k_lno", "text", null, "ltr"], ["membershipNumber", "k_mem", "text"], ["membershipExpiry", "k_memx", "date"], ["totalJumps", "k_jumps", "num"], ["firstJumpDate", "k_first_jump", "date"], ["extraLicenses", "k_xlic", "xl"]],
    f_rig: [["rigOwnership", "k_rigown", "select", "rigown"], ["rigType", "k_rigtype", "select", "rig"], ["mainModel", "k_mainm", "text", null, "ltr"], ["mainSize", "k_mains", "num"], ["reserveRepackDate", "k_repack", "date"]],
    f_med: [["medicalType", "k_medtype", "select", "med"], ["medicalExpiry", "k_medx", "date"], ["insuranceProvider", "k_inprov", "text"], ["insurancePolicyNumber", "k_inno", "text"], ["insuranceExpiry", "k_inx", "date"]],
    f_emg: [["emergencyNameFa", "k_ename_fa", "text"], ["emergencyNameEn", "k_ename_en", "text", null, "ltr"], ["emergencyPhone", "k_ephone", "tel"], ["emergencyRelation", "k_erel", "select", "rel"]]
  };
  function LAT(s) { return String(s === null || s === undefined ? "" : s).replace(/[۰-۹]/g, function (d) { return FAD.indexOf(d); }).replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }); }
  function getVal(k) { var p = prof(), e = ext(); if (k === "extraLicenses") return e.extraLicenses || []; var v = SNAKE[k] ? p[SNAKE[k]] : e[k]; return v === null || v === undefined ? "" : v; }
  function optLabel(set, v) { var list = OPT[set]; for (var i = 0; i < list.length; i++) { if (list[i][0] === v) return list[i][L === "fa" ? 1 : 2]; } return v; }
  function optHtml(set, cur) {
    var list = OPT[set], h = '<option value="">—</option>';
    list.forEach(function (o) { var val = o[0], lab = o[L === "fa" ? 1 : 2]; h += '<option value="' + esc(val) + '"' + (val === cur ? " selected" : "") + ">" + esc(lab) + "</option>"; });
    return h;
  }
  function startEdit(folder) { var vals = {}; EDIT[folder].forEach(function (f) { var v = getVal(f[0]); vals[f[0]] = f[2] === "xl" ? JSON.parse(JSON.stringify(v)) : String(v); }); S.edit = { folder: folder, vals: vals, review: false, err: "" }; render(); toTop(); }
  var GM = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function dateBtn(k, v) { return '<button type="button" class="dd-btn" data-act="cal" data-k="' + k + '"><span class="v' + (v ? "" : " ph") + '">' + (v ? esc(dateTxt(v)) : tx("pickDate")) + '</span><span class="cal-ic">' + ic("cal") + "</span></button>"; }
  function addYears(n) { var d = todayTehran(); return (+d.slice(0, 4) + n) + d.slice(4); }
  function calRange(k) { return /Expiry$/.test(k) ? [addYears(-10), addYears(25)] : k === "birthDate" ? [addYears(-100), todayTehran()] : [addYears(-70), todayTehran()]; }
  function calParts(iso) { var y = +iso.slice(0, 4), m = +iso.slice(5, 7), d = +iso.slice(8, 10); return L === "fa" ? g2j(y, m, d) : [y, m, d]; }
  function calIso(y, m, d) { if (L === "fa") { var g = j2g(y, m, d); return g[0] + "-" + pad(g[1]) + "-" + pad(g[2]); } return y + "-" + pad(m) + "-" + pad(d); }
  function jLen(y, m) { if (m <= 6) return 31; if (m <= 11) return 30; var g = j2g(y, 12, 30), b = g2j(g[0], g[1], g[2]); return b[0] === y && b[1] === 12 && b[2] === 30 ? 30 : 29; }
  function openCal(k) {
    var r = calRange(k), cur = S.edit.vals[k], t = todayTehran(), base = cur || (k === "birthDate" ? addYears(-25) : t); if (base < r[0]) base = r[0]; if (base > r[1]) base = r[1];
    var pr = calParts(base); S.cal = { k: k, mode: "days", vy: pr[0], vm: pr[1], min: r[0], max: r[1] }; render();
  }
  function calModal() {
    var c = S.cal; if (!c) return ""; var fa = L === "fa", MN = fa ? JM : GM, cur = S.edit && S.edit.vals[c.k], t = todayTehran(), rtl = fa;
    var y0 = calParts(c.min)[0], y1 = calParts(c.max)[0], h = '<div class="modal" data-act="calclose"><div class="sheet calsheet">';
    if (c.mode === "days") {
      var len = fa ? jLen(c.vy, c.vm) : new Date(Date.UTC(c.vy, c.vm, 0)).getUTCDate(), dow = new Date(calIso(c.vy, c.vm, 1) + "T00:00:00Z").getUTCDay(), lead = fa ? (dow + 1) % 7 : dow;
      h += '<div class="cal-head"><button type="button" class="cal-nav" data-act="calnav" data-n="-1">' + (rtl ? "›" : "‹") + '</button><button type="button" class="cal-title" data-act="calym">' + MN[c.vm - 1] + " " + D(c.vy) + ' ▾</button><button type="button" class="cal-nav" data-act="calnav" data-n="1">' + (rtl ? "‹" : "›") + "</button></div>";
      h += '<div class="cal-grid wk">' + (fa ? ["ش", "ی", "د", "س", "چ", "پ", "ج"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]).map(function (w) { return "<span>" + w + "</span>"; }).join("") + '</div><div class="cal-grid">';
      for (var i = 0; i < lead; i++) h += "<span></span>";
      for (var d = 1; d <= len; d++) { var iso = calIso(c.vy, c.vm, d), dis = iso < c.min || iso > c.max; h += '<button type="button" data-act="calday" data-iso="' + iso + '" class="' + (dis ? "dis" : "") + (iso === cur ? " sel" : "") + (iso === t ? " today" : "") + '"' + (dis ? " disabled" : "") + ">" + D(d) + "</button>"; }
      h += "</div>";
    } else {
      h += '<div class="cal-head"><button type="button" class="cal-title" data-act="calym">' + MN[c.vm - 1] + " " + D(c.vy) + ' ▴</button></div><div class="cal-ym"><div class="months">' + MN.map(function (n, i) { return '<button type="button" data-act="calm" data-m="' + (i + 1) + '" class="' + (i + 1 === c.vm ? "sel" : "") + '">' + n + "</button>"; }).join("") + '</div><div class="years">';
      for (var y = y0; y <= y1; y++) h += '<button type="button" data-act="caly" data-y="' + y + '" class="' + (y === c.vy ? "sel" : "") + '">' + D(y) + "</button>";
      h += "</div></div>";
    }
    return h + '<div class="cal-foot"><button type="button" data-act="calclr">' + tx("cal_clear") + '</button><button type="button" data-act="caltoday"' + (t < c.min || t > c.max ? " disabled" : "") + ">" + tx("today") + "</button></div></div></div>";
  }
  function dpHtml(k, v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v || ""), j = m ? g2j(+m[1], +m[2], +m[3]) : [0, 0, 0], ty = g2j(+todayTehran().slice(0, 4), +todayTehran().slice(5, 7), +todayTehran().slice(8, 10))[0];
    function sel(part, lab, from, to, cur, nameFn) { var o = '<option value="">' + lab + "</option>"; for (var i = from; i <= to; i++) o += '<option value="' + i + '"' + (i === cur ? " selected" : "") + ">" + esc(nameFn ? nameFn(i) : D(i)) + "</option>"; return '<select class="dps" data-dp="' + k + '" data-part="' + part + '">' + o + "</select>"; }
    return '<div class="dpick">' + sel("d", tx("dp_d"), 1, 31, j[2]) + sel("m", tx("dp_m"), 1, 12, j[1], function (i) { return JM[i - 1]; }) + sel("y", tx("dp_y"), 1300, ty + 30, j[0]) + "</div>";
  }
  function onDp(i) {
    var k = i.getAttribute("data-dp"), box = i.parentNode, v = {}; [].forEach.call(box.querySelectorAll("select"), function (x) { v[x.getAttribute("data-part")] = +x.value || 0; });
    if (!v.y && !v.m && !v.d) { S.edit.vals[k] = ""; return; }
    if (!v.y || !v.m || !v.d) return;
    var mx = v.m <= 6 ? 31 : v.m <= 11 ? 30 : 29; if (v.d > mx) { v.d = mx; box.querySelector('[data-part="d"]').value = String(mx); }
    var g = j2g(v.y, v.m, v.d); S.edit.vals[k] = g[0] + "-" + pad(g[1]) + "-" + pad(g[2]);
  }
  function editForm(folder) {
    var ed = S.edit, h = '<form class="card" id="ef" autocomplete="off">';
    EDIT[folder].forEach(function (f) {
      var k = f[0], lab = tx(f[1]), v = ed.vals[k];
      if (f[2] === "xl") {
        h += '<div class="h2">' + lab + "</div>";
        (v || []).forEach(function (r, i) { h += '<div class="xlrow"><select data-xl="' + i + '" data-xf="authority">' + optHtml("org", r.authority) + '</select><input class="ltr" data-xl="' + i + '" data-xf="number" value="' + esc(r.number) + '"><button type="button" class="btn sm" data-act="rmxl" data-i="' + i + '">✕</button></div>'; });
        h += '<button type="button" class="btn sm" data-act="addxl">+ ' + tx("add_lic") + "</button>";
        return;
      }
      var inp;
      if (f[2] === "select") inp = '<select data-ed="' + k + '">' + optHtml(f[3], v) + "</select>";
      else if (f[2] === "date") inp = dateBtn(k, v);
      else inp = '<input data-ed="' + k + '" type="' + (f[2] === "date" ? "date" : "text") + '" class="' + (f[4] === "ltr" || f[2] !== "text" ? "ltr" : "") + '"' + (f[2] === "num" ? ' inputmode="decimal"' : f[2] === "tel" ? ' inputmode="tel"' : f[2] === "email" ? ' inputmode="email" autocapitalize="off"' : "") + ' value="' + esc(f[2] === "num" || f[2] === "tel" ? D(v) : v) + '">';
      h += '<label class="fld"><span>' + lab + "</span>" + inp + "</label>";
      if (k === "bloodType" && String(v || "") !== String(getVal("bloodType") || "") && v) h += '<div class="card bloodf"><b>' + tx("blood_file") + '</b><div class="muted">' + tx("blood_hint") + '</div><label class="btn sm">' + tx("blood_pick") + '<input type="file" hidden data-bf="1" accept="image/jpeg,image/png,image/webp,application/pdf"></label> <span class="muted bfname">' + (ed.bf ? esc(ed.bf.name) : "") + "</span></div>";
    });
    BAR = '<button class="btn pri grow" type="submit" form="ef">' + tx("review") + '</button><button class="btn" type="button" data-act="editcancel">' + tx("cancel") + "</button>"; return h + '<div class="err" role="alert">' + esc(ed.err) + "</div></form>";
  }
  function norm(f, v) { if (f[2] === "tel" || f[2] === "num" || f[2] === "date") return LAT(v).trim(); return String(v === null || v === undefined ? "" : v).trim(); }
  function collectChanges(folder) {
    var ed = S.edit, ch = [];
    EDIT[folder].forEach(function (f) {
      var k = f[0], cur = getVal(k), nv = ed.vals[k];
      if (f[2] === "xl") {
        var a = (nv || []).map(function (r) { return { authority: r.authority || "Other", number: LAT(r.number).trim() }; }).filter(function (r) { return r.number; }), b = (cur || []).map(function (r) { return { authority: r.authority, number: String(r.number || "").trim() }; });
        if (JSON.stringify(a) !== JSON.stringify(b)) ch.push({ k: k, f: f, old: b, nw: a });
        return;
      }
      var o = String(cur === null || cur === undefined ? "" : cur).trim(), n = norm(f, nv);
      if (o !== n) ch.push({ k: k, f: f, old: o, nw: f[2] === "num" ? (n === "" ? null : (isNaN(Number(n)) ? n : Number(n))) : n });
    });
    return ch;
  }
  function showVal(f, v) {
    if (f[2] === "xl") return (v || []).length ? v.map(function (r) { return optLabel("org", r.authority) + " " + r.number; }).join("، ") : "—";
    if (v === "" || v === null) return "—";
    if (f[2] === "select") return optLabel(f[3], v);
    if (f[2] === "date") return dateTxt(v);
    return D(v);
  }
  function reviewView() {
    var ed = S.edit, h = '<div class="card mine"><b>' + tx("rev_h") + "</b><p class=\"muted\">" + tx("rev_note") + '</p></div><div class="card"><div class="kv">';
    ed.changes.forEach(function (c) { h += "<div><span>" + tx(c.f[1]) + '</span><span><s class="muted">' + esc(showVal(c.f, c.old)) + "</s><br>" + esc(showVal(c.f, c.nw)) + "</span></div>"; });
    BAR = '<button class="btn pri grow" data-act="editconfirm"' + (S.busy ? " disabled" : "") + ">" + tx("confirm_send") + '</button><button class="btn" data-act="editback">' + tx("back") + "</button>"; return h + "</div></div>" + (ed.bf ? '<p class="muted">📎 ' + esc(ed.bf.name) + "</p>" : "");
  }
  function folderView(key) {
    var p = prof(), e = ext();
    if (key === "f_profile") return kv([["k_first", L === "fa" ? (e.firstNameFa || p.first_name) : (e.firstNameEn || p.first_name)], ["k_last", L === "fa" ? (e.lastNameFa || p.last_name) : (e.lastNameEn || p.last_name)], ["k_father", L === "fa" ? (e.fatherNameFa || e.fatherName) : (e.fatherNameEn || e.fatherName)], ["k_birth", dateTxt(e.birthDate)], ["k_blood", optLabel("blood", e.bloodType)], ["k_gender", e.gender ? optLabel("gender", e.gender) : ""], ["k_nat", e.nationalityType === "Foreign" ? e.nationalityCountry : (L === "fa" ? "ایرانی" : "Iranian")], ["k_id", e.nationalId || e.passportNumber], ["k_phone", p.phone], ["k_email", p.email], ["k_h", p.height_cm], ["k_w", p.weight_kg]]);
    if (key === "f_cred") {
      var h = '<div class="h2">' + tx("lic_main") + "</div>" + kv([["k_org", optLabel("org", p.organization)], ["k_ltype", optLabel("lic", p.license_type)], ["k_lno", p.license_number]]);
      (e.extraLicenses || []).forEach(function (x, i) { h += '<div class="h2">' + tx("lic_n") + " " + D(i + 2) + "</div>" + kv([["k_org", optLabel("org", x.authority)], ["k_lno", x.number]]); });
      return h + '<div class="h2">' + tx("mem_h") + "</div>" + kv([["k_mem", e.membershipNumber], ["k_memx", dateTxt(p.membership_expiry)], ["k_jumps", e.totalJumps], ["k_first_jump", dateTxt(p.first_jump_date)]]);
    }
    if (key === "f_rig") { var due = ""; if (p.reserve_repack_date) { var d = new Date(p.reserve_repack_date + "T12:00:00Z"); if (!isNaN(d)) { d.setUTCDate(d.getUTCDate() + 180); due = d.toISOString().slice(0, 10); } } return kv([["k_rigown", p.rig_ownership === "Rental" ? tx("rental") : tx("own")], ["k_rigtype", optLabel("rig", p.rig_type)], ["k_main", ((p.main_model || "") + " " + (p.main_size || "")).trim()], ["k_repack", dateTxt(p.reserve_repack_date)], ["k_repackdue", dateTxt(due)]]); }
    if (key === "f_med") return kv([["k_medtype", optLabel("med", e.medicalType)], ["k_medx", dateTxt(e.medicalExpiry)], ["k_inprov", e.insuranceProvider], ["k_inno", e.insurancePolicyNumber], ["k_inx", dateTxt(e.insuranceExpiry)]]);
    if (key === "f_emg") return kv([["k_ename", L === "fa" ? (e.emergencyNameFa || p.emergency_name) : (e.emergencyNameEn || p.emergency_name)], ["k_ephone", p.emergency_phone], ["k_erel", p.emergency_relation ? optLabel("rel", p.emergency_relation) : ""]]);
    return "";
  }
  function logStats(rows) {
    var yr = function (iso) { return L === "fa" ? g2j(+iso.slice(0, 4), +iso.slice(5, 7), +iso.slice(8, 10))[0] : +iso.slice(0, 4); }, ty = yr(todayTehran());
    var base = +((S.me && S.me.ext && S.me.ext.totalJumps) || 0) || 0, year = 0, mx = 0, last = "", types = {};
    rows.forEach(function (r) { if (r.d) { if (yr(r.d) === ty) year++; if (!last || r.d > last) last = r.d; } if (+r.alt > mx) mx = +r.alt; var t = jtAb(r.jt) || "—"; types[t] = (types[t] || 0) + 1; });
    var ago = last ? daysUntil(last) : null, tk = Object.keys(types).sort(function (a, b) { return types[b] - types[a]; }).slice(0, 5), top = tk.length ? types[tk[0]] : 1;
    var h = '<div class="card lstats"><div class="h2">' + tx("log_stats") + '</div><div class="lsg"><div><b>' + D(base + rows.length) + "</b><span>" + tx("ls_total") + "</span></div><div><b>" + D(year) + "</b><span>" + tx("ls_year") + "</span></div><div><b>" + (mx ? D(mx) : "—") + "</b><span>" + tx("ls_max") + " (ft)</span></div><div><b>" + (last ? dateTxt(last) : "—") + "</b><span>" + tx("ls_last") + (ago !== null && ago <= 0 ? " · " + fmt(tx("ls_ago"), { d: -ago }) : "") + "</span></div></div>";
    if (tk.length) { h += '<div class="h2" style="margin-top:12px">' + tx("ls_types") + "</div>"; tk.forEach(function (t) { h += '<div class="lbar"><span>' + esc(t) + '</span><div><i style="width:' + Math.round(types[t] * 100 / top) + '%"></i></div><b>' + D(types[t]) + "</b></div>"; }); }
    if (base) h += '<p class="muted small" style="margin:10px 0 0">' + tx("ls_base") + ": " + D(base) + " + " + tx("ls_rec") + ": " + D(rows.length) + "</p>";
    return h + "</div>";
  }
  function logBody() {
    var rows = S.log;
    if (rows === null || rows === undefined) return '<div class="empty">…</div>';
    if (!rows.length) return '<div class="empty">' + tx("log_none") + "</div>";
    var h = logStats(rows) + '<div class="card logt"><div class="lr lh"><span>' + tx("log_date") + "</span><span>" + tx("log_load") + "</span><span>" + tx("log_ac") + "</span><span>" + tx("log_type") + "</span><span>" + tx("log_alt") + "</span></div>";
    var curD = "", perDay = {}; rows.forEach(function (r) { perDay[r.d] = (perDay[r.d] || 0) + 1; });
    rows.forEach(function (r) { if (r.d !== curD) { curD = r.d; h += '<div class="lr ldh"><b>' + dateTxt(r.d) + "</b><span>" + D(perDay[r.d]) + " " + tx("ls_jumps") + "</span></div>"; } h += '<div class="lr"><span>' + dateTxt(r.d) + "</span><span>" + D(r.n) + '</span><span class="ltr">' + esc(r.ac || "—") + "</span><span>" + esc(jtAb(r.jt) || "—") + "</span><span>" + (r.alt ? D(r.alt) : "—") + "</span></div>"; });
    return h + "</div>";
  }
  function folderBody(key) {
    if (key === "f_docs") return docsBody();
    if (key === "f_pw") return pwBody();
    if (key === "f_log") return logBody();
    if (S.edit && S.edit.folder === key) return S.edit.review ? reviewView() : editForm(key);
    return folderView(key);
  }
  function docsBody() {
    var e = ext(), p = prof(), docs = (S.me && S.me.docs) || [];
    function has(t) { return docs.some(function (d) { return d.type === t; }); }
    var pending = {}; S.msgs.forEach(function (m) { if (!m.staff && m.attach && m.attach.kind) pending[m.attach.kind] = 1; });
    var foreign = e.nationalityType === "Foreign", sky = e.skydiverCategory === "Skydiver", tandem = e.skydiverCategory === "Tandem Passenger";
    var items = [["photo", "d_photo", !!(S.me && S.me.hasPhoto), true], [foreign ? "passport" : "nationalId", foreign ? "d_pass" : "d_nid", has(foreign ? "Passport" : "National ID"), true]];
    if (p.license_number) items.push(["license", "d_lic", has("License"), true]);
    if (!tandem && (sky || (e.totalJumps || 0) > 0)) items.push(["logbook", "d_log", has("Logbook Last Page"), true]);
    if (!tandem && p.rig_ownership !== "Rental") items.push(["dataCard", "d_card", has("Rig Data Card"), false]);
    items.push(["medical", "d_med", has("Medical Certificate"), false], ["insurance", "d_ins", has("Insurance Policy"), false], ["bloodTest", "d_blood", has("Blood Test"), false, "n_blood"]);
    if (!tandem) items.push(["rigPhoto", "d_rig", has("Rig Photo"), false, "n_rig"], ["canopyPhoto", "d_can", has("Canopy Photo"), false, "n_can"]);
    var h = '<p class="muted">' + tx("doc_hint") + '</p><div class="card">';
    items.forEach(function (it) {
      h += '<div class="docrow"><div class="grow"><b>' + tx(it[1]) + '</b> <span class="muted">(' + tx(it[3] ? "req" : "opt") + ')</span>' + (it[4] ? '<div class="muted small">' + tx(it[4]) + "</div>" : "") + '<div class="muted">' + (it[2] ? '<span class="chip ok">' + tx("ok") + "</span>" : '<span class="chip bad">' + tx("miss") + "</span>") + (pending[it[0]] ? ' <span class="chip go">' + tx("uploaded") + "</span>" : "") + '</div></div><label class="btn sm">' + tx("upload") + '<input type="file" hidden data-kind="' + it[0] + '" accept="image/jpeg,image/png,image/webp,application/pdf"></label></div>';
    });
    return h + "</div>";
  }
  function viewMe() {
    if (!S.me) return '<div class="empty">…</div>';
    if (!S.me.found) return '<div class="empty">' + tx("me_nf") + "</div>";
    if (S.view) { var fb = folderBody(S.view); if (!S.edit || S.edit.folder !== S.view) BAR = '<button class="btn" data-act="back">' + (L === "fa" ? "→ " : "← ") + tx("back") + "</button>" + (EDIT[S.view] ? '<button class="btn pri grow" data-act="edit" data-f="' + S.view + '">✏️ ' + tx("edit") + "</button>" : ""); return '<div class="backrow"><b class="ftitle">' + tx(S.view) + "</b></div>" + fb; }
    var h = '<div class="card row">' + (S.photo ? '<img class="avatar" src="' + esc(S.photo) + '" alt="">' : '<div class="avatar ph">' + ic("user") + "</div>") + '<div class="grow"><div class="ld-title">' + esc(personName()) + '</div><div class="muted ltr">' + esc((prof().code || "")) + " " + esc(D(S.sess.username)) + "</div></div></div>";
    h += readyCard();
    h += '<div class="folders">' + FOLDERS.map(function (f) { return '<button class="folder" style="--c:' + f[2] + '" data-folder="' + f[0] + '"><span class="fi">' + ic(f[1]) + "</span><b>" + tx(f[0]) + "</b></button>"; }).join("") + "</div>";
    return h;
  }
  function readyCard() {
    var p = prof(), e = ext(), due = "";
    if (p.reserve_repack_date) { var d = new Date(p.reserve_repack_date + "T12:00:00Z"); if (!isNaN(d)) { d.setUTCDate(d.getUTCDate() + 180); due = d.toISOString().slice(0, 10); } }
    var items = [["w_mem", p.membership_expiry], ["w_med", e.medicalExpiry], ["w_ins", e.insuranceExpiry], ["rd_rep", due]];
    var h = '<div class="card ready"><div class="h2">' + tx("rd_h") + '</div>';
    items.forEach(function (it) { var dl = it[1] ? daysUntil(it[1]) : null, cls = dl === null ? "na" : dl < 0 ? "bad" : dl <= 30 ? "warn" : "ok", txt = dl === null ? tx("rd_none") : dl < 0 ? tx("rd_exp") : fmt(tx("rd_left"), { d: dl }); h += '<div class="rd ' + cls + '"><i></i><span class="grow"><b>' + tx(it[0]) + '</b><small>' + (it[1] ? dateTxt(it[1]) : "") + "</small></span><em>" + txt + "</em></div>"; });
    return h + "</div>";
  }
  function modalHtml() { return calModal() + bellModal() + loadModal() + sosModal() + chatModals() + (S.img ? '<div class="imgview" data-act="closeimg"><img src="' + esc(S.img) + '" alt=""><a class="imgopen" href="' + esc(S.img) + '" target="_blank" rel="noopener">⬇</a></div>' : ""); }

  function refreshLog() { return authed("jumper_logbook").then(function (d) { var n = JSON.stringify(d || []); if (n !== S.logSig) { S.logSig = n; S.log = d || []; return true; } return false; }).catch(function () { return false; }); }
  function handleAct(a, t, ev) {
    if (chatAct(a, t, ev)) return true;
    if (a === "cal") { openCal(t.dataset.k); return true; }
    if (a === "calclose") { if (ev.target === t) { S.cal = null; render(); } return true; }
    if (a === "calnav") { var m2 = S.cal.vm + +t.dataset.n, y2 = S.cal.vy; if (m2 > 12) { m2 = 1; y2++; } if (m2 < 1) { m2 = 12; y2--; } S.cal.vy = y2; S.cal.vm = m2; render(); return true; }
    if (a === "calym") { S.cal.mode = S.cal.mode === "days" ? "ym" : "days"; render(); var sy = document.querySelector(".years .sel"); if (sy) sy.scrollIntoView({ block: "center" }); return true; }
    if (a === "calm") { S.cal.vm = +t.dataset.m; S.cal.mode = "days"; render(); return true; }
    if (a === "caly") { S.cal.vy = +t.dataset.y; render(); var sy2 = document.querySelector(".years .sel"); if (sy2) sy2.scrollIntoView({ block: "center" }); return true; }
    if (a === "calday") { S.edit.vals[S.cal.k] = t.dataset.iso; S.cal = null; render(); return true; }
    if (a === "calclr") { S.edit.vals[S.cal.k] = ""; S.cal = null; render(); return true; }
    if (a === "caltoday") { S.edit.vals[S.cal.k] = todayTehran(); S.cal = null; render(); return true; }
    if (a === "bell") { S.bell = true; S.notes.forEach(function (n) { n.read = true; }); saveNotes(); render(); return true; }
    if (a === "closebell") { if (ev.target === t || t.tagName === "BUTTON") { S.bell = false; render(); } return true; }
    if (a === "clearnotes") { S.notes = []; saveNotes(); render(); return true; }
    if (a === "pushtog") { if (pushActive()) pushOff(); else pushOn(); return true; }
    if (a === "sndtest") { vUnlock(); setTimeout(function () { VQ = Promise.resolve(); var on = lsGet("mj_snd", true); if (!on) lsSet("mj_snd", true); speakCall(1, 20); if (!on) setTimeout(function () { lsSet("mj_snd", false); }, 100); }, 80); return true; }
    if (a === "sndtog") { lsSet("mj_snd", !lsGet("mj_snd", true)); if (lsGet("mj_snd", true)) beep(); render(); return true; }
    if (a === "setbg") { lsSet("mj_bg", lsGet("mj_bg", true) ? false : true); render(); return true; }
    if (a === "gopw") { S.tab = "me"; S.view = "f_pw"; S.anim = true; render(); toTop(); return true; }
    if (a === "openload") { S.modal = t.dataset.key; render(); return true; }
    if (a === "closemodal") { if (ev.target === t || t.tagName === "BUTTON") { S.modal = ""; render(); } return true; }
    if (a === "edit") { startEdit(t.dataset.f); return true; }
    if (a === "editcancel") { S.edit = null; render(); return true; }
    if (a === "editback") { S.edit.review = false; render(); return true; }
    if (a === "addxl") { S.edit.vals.extraLicenses.push({ authority: "USPA", number: "" }); render(); return true; }
    if (a === "rmxl") { S.edit.vals.extraLicenses.splice(+t.dataset.i, 1); render(); return true; }
    if (a === "editconfirm") {
      var ch = S.edit.changes, changes = {}; ch.forEach(function (c) { changes[c.k] = c.nw; });
      S.busy = true; render();
      var pre = Promise.resolve();
      if (S.edit.bf && ch.some(function (c) { return c.k === "bloodType"; })) { var bf = S.edit.bf, bsafe = bf.name.replace(/[^A-Za-z0-9._-]/g, "_").slice(-60) || "file", bpath = "jumper/" + S.sess.username + "/" + Date.now() + "-bloodTest-" + bsafe; pre = fetch(CFG.url + "/storage/v1/object/registration-docs/" + bpath, { method: "POST", headers: hdr({ "Content-Type": bf.type, "x-upsert": "false" }), body: bf }).then(function (r) { if (!r.ok) throw new Error("up"); return sendMsg("", { kind: "bloodTest", path: bpath, name: bf.name, mime: bf.type, size: bf.size }); }); }
      pre.then(function () { return sendMsg("", { kind: "edit", folder: S.edit.folder, path: "jumper/" + S.sess.username + "/edit-" + Date.now(), name: "edit", mime: "application/json", changes: changes }); }).then(function () { S.busy = false; S.edit = null; render(); toast(tx("edit_sent")); }).catch(function () { S.busy = false; render(); toast(tx("fail")); });
      return true;
    }
    if (a === "openchat") { openChat(t.dataset.p); return true; }
    if (a === "chatback") { S.peer = ""; S.anim = true; render(); toTop(); return true; }
    if (a === "play") { playVoice(+t.dataset.id); return true; }
    if (a === "msgsel") { var id = +t.dataset.id; S.sel = S.sel === id ? 0 : id; updateThread(); return true; }
    if (a === "msgdel") { var did = +t.dataset.id; S.sel = 0; (did >= 1000000000 ? authed("jumper_dm_delete", { p_id: did - 1000000000 }).then(function () { return refreshDm(); }) : authed("jumper_delete_msg", { p_id: did }).then(function () { return refreshMsgs(); })).then(updateThread).catch(function () { toast(tx("fail")); }); ev.stopPropagation(); return true; }
    if (a === "viewimg") { S.img = t.dataset.u; render(); return true; }
    if (a === "closeimg") { S.img = ""; render(); return true; }
    if (a === "rec") { recStart(); return true; }
    if (a === "recx") { recStop(false); return true; }
    if (a === "recsend") { recStop(true); return true; }
    if (a === "sos") { S.sos = { step: "ask" }; render(); return true; }
    if (a === "soscancel") { if (ev.target === t || t.tagName === "BUTTON") { S.sos = null; render(); } return true; }
    if (a === "sosgo") { sendSos(); return true; }
    return false;
  }
  function setVh() {
    var h = window.innerHeight, vv = window.visualViewport, top = 0;
    if (vv && vv.height > h) h = vv.height;
    if (vv && S.sess && S.tab === "msgs" && chatOpen() && vv.height > 200) { h = vv.height; top = vv.offsetTop; }
    if (h > 200) document.documentElement.style.setProperty("--vh", h + "px");
    document.documentElement.style.setProperty("--vt", top + "px");
    /* iPhone home-screen app: if the page stops short of the real screen bottom, stretch the app down to it */
    var gap = 0;
    try { if (window.navigator.standalone && window.screen && window.screen.height && !(vv && vv.height < window.innerHeight - 120)) { var sh = Math.max(screen.height, screen.width) === screen.height ? screen.height : screen.width; var ih = window.innerHeight; if (window.matchMedia("(orientation: portrait)").matches && sh - ih > 0 && sh - ih < 80) gap = sh - ih; } } catch (e) { gap = 0; }
    document.documentElement.style.setProperty("--gap", gap + "px");
  }
  setVh(); window.addEventListener("resize", setVh); window.addEventListener("orientationchange", function () { setTimeout(setVh, 250); }); if (window.visualViewport) { window.visualViewport.addEventListener("resize", function () { setVh(); if (S.tab === "msgs" && chatOpen() && !S.userScrolled) setTimeout(thrEnd, 50); }); window.visualViewport.addEventListener("scroll", function () { if (S.tab === "msgs" && chatOpen()) { setVh(); window.scrollTo(0, 0); } }); }
  [150, 500, 1200, 2500, 5000].forEach(function (ms) { setTimeout(setVh, ms); });
  function toTop() { window.scrollTo(0, 0); var p = document.querySelector(".page"); if (p) p.scrollTop = 0; }
  var BG = { n: 10, i: 0, t: 0, el: null };
  function bgApply() {
    var on = lsGet("mj_bg", true);
    if (!on) { if (BG.el) { BG.el.remove(); BG.el = null; } clearInterval(BG.t); BG.t = 0; return; }
    if (BG.el) return;
    var box = document.createElement("div"); box.id = "bgs"; box.setAttribute("aria-hidden", "true");
    for (var i = 1; i <= BG.n; i++) { var e = document.createElement("i"); e.setAttribute("data-s", "hero/q" + i + ".webp"); box.appendChild(e); }
    document.body.insertBefore(box, document.body.firstChild); BG.el = box; BG.i = Math.floor(Math.random() * BG.n);
    function show() { var els = box.children, el = els[BG.i]; if (!el.style.backgroundImage) el.style.backgroundImage = 'url("' + el.getAttribute("data-s") + '")'; for (var j = 0; j < els.length; j++) { if (j === BG.i) { els[j].classList.remove("lv"); els[j].classList.add("on"); } else if (els[j].classList.contains("on")) { els[j].classList.remove("on"); els[j].classList.add("lv"); (function (x) { setTimeout(function () { x.classList.remove("lv"); }, 2900); })(els[j]); } } var nx = els[(BG.i + 1) % BG.n]; if (!nx.style.backgroundImage) nx.style.backgroundImage = 'url("' + nx.getAttribute("data-s") + '")'; }
    show(); BG.t = setInterval(function () { BG.i = (BG.i + 1) % BG.n; show(); }, 7000);
  }
  var BAR = "";
  var GMS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function topDate() { var n = new Date(), y = n.getFullYear(), m = n.getMonth() + 1, d = n.getDate(); if (L === "fa") { var j = g2j(y, m, d); return D(j[2]) + " " + JM[j[1] - 1] + " " + D(j[0]); } return d + " " + GMS[m - 1] + " " + y; }
  var APPV = "42";
  function viewShell() {
    BAR = ""; var forced = S.sess && S.sess.mustChange; var body = forced ? pwBody() : S.tab === "loads" ? viewLoads() : S.tab === "log" ? viewLogTab() : S.tab === "set" ? viewSettings() : S.tab === "msgs" ? viewMsgs() : viewMe();
    var nA = unreadNotes(), nM = unreadMsgs();
    function tab(k, icn, label, n, b) { return '<button class="' + (S.tab === k ? "on" : "") + '" data-tab="' + k + '"><span class="ti">' + ic(icn) + "</span>" + label + (b ? '<span class="badge" data-b="' + b + '" style="' + (n ? "" : "display:none") + '">' + D(n) + "</span>" : "") + "</button>"; }
    return '<div class="shell' + (S.anim ? " enter" : "") + '"><div class="top"><img src="logo.png" alt=""><b>' + tx("app") + '</b><span class="topdate">' + topDate() + "</span>" + (forced ? langSwitch() : "") + '<button class="iconbtn bellbtn' + (nA ? " has" : "") + '" data-act="bell" title="' + tx("t_alerts") + '">' + ic("alerts") + '<span class="badge bb" data-b="alerts" style="' + (nA ? "" : "display:none") + '">' + D(nA) + '</span></button>' + (forced ? '<button class="iconbtn" data-act="logout" title="' + tx("logout") + '">' + ic("logout") + "</button>" : "") + '</div><div class="page' + (S.anim ? " enter" : "") + '">' + body + "</div>" + (BAR ? '<div class="fixbar">' + BAR + "</div>" : "") +
      (forced ? "" : '<nav class="tabs">' + tab("loads", "loads", tx("t_loads")) + tab("msgs", "msgs", tx("t_msgs"), nM, "msgs") + tab("log", "book", tx("f_log")) + tab("me", "user", tx("t_me")) + tab("set", "gear", tx("t_set")) + "</nav>") + modalHtml() + (S.toast ? '<div class="toast">' + esc(S.toast) + "</div>" : "") + stampFull() + "</div>";
  }
  function stampFull() {
    if (!S.sbOn || !S.sess || S.tab !== "loads" || chatOpen()) { if (!S.sbOn) S.stampSeen = false; return ""; }
    var h = '<div class="stampfull" aria-hidden="true"><svg width="0" height="0" style="position:absolute" focusable="false"><filter id="inkRough" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3" result="warp"/><feDisplacementMap in="SourceGraphic" in2="warp" scale="8" result="rough"/><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="8" result="grain"/><feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  9 0 0 0 -2.9" result="holes"/><feComposite in="rough" in2="holes" operator="in"/></filter></svg><div class="stamp' + (S.stampSeen ? " still" : "") + '"><b>' + (L === "fa" ? "استندبای" : "STANDBY") + "</b></div></div>";
    if (!S.stampSeen) setTimeout(function () { S.stampSeen = true; }, 1500);
    return h;
  }
  var NOFIX = /^(SCRIPT|STYLE|TEXTAREA|INPUT|SELECT|OPTION)$/;
  function fixDigits(root) {
    if (!root) return; var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) { var pe = n.parentNode; if (!pe || NOFIX.test(pe.nodeName) || (pe.closest && pe.closest(".mtxt,[data-keep]"))) continue; list.push(n); }
    list.forEach(function (t) { var o = t.nodeValue; if (!/[0-9۰-۹٠-٩]/.test(o)) return; var v = D(o); if (v !== o) t.nodeValue = v; });
  }
  function render() {
    document.documentElement.lang = L; document.documentElement.dir = L === "fa" ? "rtl" : "ltr";
    var pgEl = document.querySelector(".page"), keepTop = pgEl ? pgEl.scrollTop : 0;
    var thOld = document.getElementById("thr"), keepThr = thOld ? thOld.scrollTop : 0, hadThr = !!thOld, atEnd = thOld ? thOld.scrollTop + thOld.clientHeight >= thOld.scrollHeight - 40 : false;
    var keepMsg = document.getElementById("mt") ? document.getElementById("mt").value : "";
    var keepR = document.getElementById("lr") ? document.getElementById("lr").checked : true, keepU = document.getElementById("lu") ? document.getElementById("lu").value : "", keepP = document.getElementById("lp") ? document.getElementById("lp").value : "";
    $app.innerHTML = S.sess ? viewShell() : (S.mode === "forgot" ? viewForgot() : viewLogin());
    if (keepMsg && document.getElementById("mt")) document.getElementById("mt").value = keepMsg;
    if (!S.sess && document.getElementById("lr")) document.getElementById("lr").checked = keepR;
    if (!S.sess) { if (keepU) document.getElementById("lu").value = keepU; if (keepP) document.getElementById("lp").value = keepP; }
    var pgNew = document.querySelector(".page"); if (pgNew && keepTop) pgNew.scrollTop = keepTop;
    setVh(); S.anim = false; fixDigits($app); bgApply();
    if (S.tab === "msgs" && S.sess && chatOpen()) { chatToggle(); voxRefresh(); var th = document.getElementById("thr"); if (th) { if (S.noscroll && hadThr) th.scrollTop = keepThr; else { S.userScrolled = false; thrEndSoon(); } } } S.noscroll = false;
  }

  /* ---------- events ---------- */
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-lang],[data-tab],[data-folder],[data-act]"); if (!t) return;
    if (t.dataset.lang) return setLang(t.dataset.lang);
    if (t.dataset.tab) return setTab(t.dataset.tab);
    if (t.dataset.folder) { S.view = t.dataset.folder; S.anim = true; S.err = ""; S.edit = null; if (S.view === "f_log") refreshLog().then(render); render(); return toTop(); }
    var a = t.dataset.act;
    if (a && handleAct(a, t, ev)) return;
    if (a === "forgot") { ev.preventDefault(); S.mode = "forgot"; S.err = ""; S.forgotCode = ""; render(); } else if (a === "tologin") { ev.preventDefault(); S.mode = ""; S.err = ""; render(); } else if (a === "back") { S.view = ""; S.edit = null; render(); } else if (a === "logout") signOut(); else if (a === "notif") askNotif();
  });
  document.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (ev.target.id === "lf") doLogin(document.getElementById("lu").value, document.getElementById("lp").value, document.getElementById("lr").checked);
    else if (ev.target.id === "ff") {
      var fu = document.getElementById("fu").value.replace(/[۰-۹]/g, function (d) { return FAD.indexOf(d); }).trim(), fp = document.getElementById("fp").value;
      if (!fu || !fp) { S.err = tx("fill"); return render(); }
      S.busy = true; S.err = ""; render();
      rpc("jumper_forgot", { p_user: fu, p_phone: fp }).then(function (r) { S.busy = false; if (r && r.ok) S.forgotCode = r.code; else S.err = tx("forgot_bad"); render(); }).catch(function (e) { S.busy = false; S.err = /locked/.test(e.code || "") ? tx("locked2") : tx("net"); render(); });
    } else if (ev.target.id === "pf") {
      var po = document.getElementById("po").value, pn = document.getElementById("pn").value, pn2 = document.getElementById("pn2").value;
      if (pn.length < 6) { S.err = tx("pw_short"); return render(); }
      if (pn !== pn2) { S.err = tx("pw_mismatch"); return render(); }
      authed("jumper_change_password", { p_old: po, p_new: pn }).then(function () { S.err = ""; S.view = ""; S.tempOld = ""; if (S.sess.mustChange) { delete S.sess.mustChange; S.tab = "loads"; var inLocal = false; try { inLocal = !!localStorage.getItem(LSK.sess); } catch (e2) { /* ignore */ } saveSess(S.sess, inLocal); } render(); toast(tx("pw_done")); }).catch(function (e) { S.err = /bad_login/.test(e.code || "") ? tx("pw_bad") : /bad_password/.test(e.code || "") ? tx("pw_short") : tx("fail"); render(); });
    }
    else if (ev.target.id === "ef") {
      var chs = collectChanges(S.edit.folder);
      if (!chs.length) { S.edit.err = tx("no_change"); return render(); }
      if (chs.some(function (c) { return c.k === "bloodType"; }) && !S.edit.bf) { S.edit.err = tx("blood_need"); return render(); }
      S.edit.err = ""; S.edit.changes = chs; S.edit.review = true; render(); toTop();
    } else if (ev.target.id === "mf") { var ta = document.getElementById("mt"), v = ta.value.trim(); if (!v) return; ta.value = ""; chatToggle(); chatPost(v).catch(function (e) { ta.value = v; toast(/slow_down/.test(e.code || "") ? tx("fail") : tx("fail")); }); }
  });
  function onEditInput(ev) {
    var i = ev.target; if (!i || !i.getAttribute || !S.edit) return;
    if (i.getAttribute("data-bf")) { var bf = i.files && i.files[0]; if (bf && (!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(bf.type) || bf.size > 5 * 1024 * 1024)) { i.value = ""; S.edit.bf = null; return toast(tx("blood_big")); } S.edit.bf = bf || null; var bn = document.querySelector(".bfname"); if (bn) bn.textContent = bf ? bf.name : ""; return; }
    if (i.getAttribute("data-dp")) return onDp(i);
    var k = i.getAttribute("data-ed"); if (k) { var was = S.edit.vals[k]; S.edit.vals[k] = i.value; if (k === "bloodType" && ev.type === "change" && was !== i.value) { render(); } return; }
    var xi = i.getAttribute("data-xl"); if (xi !== null && xi !== undefined) { S.edit.vals.extraLicenses[+xi][i.getAttribute("data-xf")] = i.value; }
  }
  document.addEventListener("input", onEditInput);
  document.addEventListener("change", onEditInput);
  document.addEventListener("input", function (ev) { if (ev.target && ev.target.id === "mt") chatToggle(); if (ev.target && ev.target.id === "pq") { S.pq = ev.target.value; var l = document.getElementById("plist"); if (l) l.innerHTML = pickList(); } });
  document.addEventListener("keydown", function (ev) { if (ev.target && ev.target.id === "mt" && ev.key === "Enter" && !ev.shiftKey && !ev.isComposing && window.matchMedia && window.matchMedia("(hover: hover)").matches) { ev.preventDefault(); var f = document.getElementById("mf"); if (f && f.requestSubmit) f.requestSubmit(); } });
  document.addEventListener("change", function (ev) { var i = ev.target; if (i && (i.id === "cf" || i.id === "cc") && i.files && i.files[0]) { chatSend(i.files[0]); i.value = ""; } });
  document.addEventListener("change", function (ev) { var i = ev.target; if (i.matches && i.matches("input[type=file][data-kind]") && i.files && i.files[0]) { uploadDoc(i.dataset.kind, i.files[0]); i.value = ""; } });
  document.addEventListener("toggle", function (ev) { var d = ev.target; if (d && d.matches && d.matches("details.fold")) S.expanded[d.getAttribute("data-key")] = d.open; }, true);

  /* ---------- start ---------- */
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(function () {});
  function hideBoot() { var b = document.getElementById("boot"); if (!b) return; b.classList.add("out"); setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 600); }
  var t0 = Date.now(), MINB = 2000, bootDone = false;
  function finishBoot() { if (bootDone) return; bootDone = true; var w = MINB - (Date.now() - t0); setTimeout(hideBoot, w > 0 ? w : 0); }
  render();
  setTimeout(finishBoot, 6000);
  if (S.sess) { var rp = refreshAll(); rp.then(startPolling); rp.then(finishBoot, finishBoot); } else finishBoot();
})();
