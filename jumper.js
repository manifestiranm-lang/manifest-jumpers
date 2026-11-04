/* Manifest — skydiver portal (installable web app). All data goes through secure database functions; the phone only holds a login token. */
(function () {
  "use strict";
  var CFG = window.REG_CONFIG;
  var $app = document.getElementById("app");
  var LSK = { lang: "mj_lang", sess: "mj_session", notes: "mj_notes", prev: "mj_prev", fired: "mj_fired", seenMsg: "mj_seen_msg", tab: "mj_tab" };
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }

  function loadSess() { try { var v = localStorage.getItem("mj_session") || sessionStorage.getItem("mj_session"); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function saveSess(sess, remember) { try { localStorage.removeItem("mj_session"); sessionStorage.removeItem("mj_session"); (remember ? localStorage : sessionStorage).setItem("mj_session", JSON.stringify(sess)); } catch (e) { /* storage blocked */ } }
  var L = lsGet(LSK.lang, "fa") === "en" ? "en" : "fa";
  var S = { sess: loadSess(), tab: lsGet(LSK.tab, "loads"), view: "", me: null, loads: null, msgs: [], dm: [], peers: [], peer: "", pq: "", anim: false, popAfter: 0, notes: lsGet(LSK.notes, []), photo: "", busy: false, err: "", toast: "", loadedAt: 0, expanded: {} };

  /* ---------- texts ---------- */
  var TX = {
    app: ["Manifest", "Manifest"], chat_title: ["منیفست", "Manifest"], dm_title: ["گفتگوها", "Chats"], reg_acct: ["ساخت حساب کاربری", "Create an account"], reg_q: ["حساب کاربری ندارید؟", "Don't have an account?"], sos_btn_t: ["درخواست کمک اضطراری", "Emergency help"], sos_sub: ["ارسال موقعیت مکانی برای مسئولان منیفست", "Send your location to Manifest staff"], blood_need: ["برای تغییر گروه خونی، عکس یا PDF آزمایش خون را هم بفرستید.", "To change your blood type, also attach a photo or PDF of the blood test."], blood_file: ["آزمایش خون (عکس یا PDF)", "Blood test (photo or PDF)"], blood_hint: ["برای تغییر گروه خونی لازم است.", "Required to change blood type."], blood_pick: ["انتخاب فایل", "Choose file"], blood_big: ["فایل باید عکس یا PDF و کمتر از ۵ مگابایت باشد.", "File must be a photo or PDF under 5 MB."], dm_new: ["گفتگوی تازه", "New chat"], dm_search: ["جستجوی نام جامپر…", "Search a jumper…"], dm_none: ["جامپری پیدا نشد.", "No jumpers found."], dm_sub: ["با دیگر جامپرها گفتگو کنید", "Chat with other jumpers"], dm_empty: ["هنوز گفتگویی با جامپرها ندارید.", "No jumper chats yet."], dm_hello: ["هنوز پیامی نیست. سلام کنید!", "No messages yet. Say hi!"], back: ["بازگشت", "Back"], chat_sub: ["پیام، عکس، فایل و پیام صوتی بفرستید", "Send messages, photos, files and voice"], today: ["امروز", "Today"], yesterday: ["دیروز", "Yesterday"], rec_no: ["این مرورگر ضبط صدا را پشتیبانی نمی‌کند.", "This browser cannot record audio."], rec_deny: ["دسترسی به میکروفن داده نشد.", "Microphone access was denied."], big15: ["حجم فایل نباید بیشتر از ۱۵ مگابایت باشد.", "The file must be 15 MB or smaller."], badtype: ["این نوع فایل پشتیبانی نمی‌شود.", "This file type is not supported."], del_msg: ["حذف پیام", "Delete message"], sys_sos: ["SOS ارسال شد", "SOS sent"], sys_edit: ["درخواست ویرایش اطلاعات ارسال شد", "Profile edit request sent"], sys_reset: ["درخواست رمز جدید ارسال شد", "Password reset request sent"], voice_lbl: ["پیام صوتی", "Voice message"], photo_lbl: ["عکس", "Photo"], sub: ["پنل اسکای‌دایور", "Skydiver portal"],
    user: ["نام کاربری (کد ملی یا شماره پاسپورت)", "Username (national ID or passport number)"], pass: ["رمز ورود", "Password"],
    login: ["ورود", "Sign in"], reg: ["ثبت‌نام ندارید؟ ثبت‌نام", "No account? Register"], logout: ["خروج", "Sign out"],
    bad_login: ["نام کاربری یا رمز درست نیست.", "Wrong username or password."], locked: ["تلاش‌های زیاد. ۱۵ دقیقه دیگر دوباره امتحان کنید.", "Too many tries. Try again in 15 minutes."],
    pending: ["ثبت‌نام شما هنوز تأیید نشده است. بعد از تأیید مسئول می‌توانید وارد شوید.", "Your registration is not approved yet. You can sign in after the staff approves it."],
    net: ["اتصال اینترنت مشکل دارد.", "Network problem."], fill: ["نام کاربری و رمز را وارد کنید.", "Enter username and password."],
    t_loads: ["لودها", "Loads"], t_alerts: ["اعلان‌ها", "Alerts"], t_msgs: ["پیام‌ها", "Messages"], t_me: ["پروفایل", "Profile"],
    loads_none: ["فعلاً لودی ثبت نشده است.", "No loads yet."], loads_mine: ["لودهای من", "My loads"], loads_all: ["همهٔ لودها", "All loads"],
    today: ["امروز", "Today"], upd: ["آخرین به‌روزرسانی", "Last update"], load: ["لود", "Load"], onload: ["شما در این لود هستید", "You are on this load"],
    seats: ["نفر", "people"], names: ["فهرست نفرات", "Manifest list"], none_on: ["هنوز کسی ثبت نشده", "Nobody yet"], leaves: ["تا پرواز", "to takeoff"],
    st: { "Open": ["باز", "Open"], "Loading": ["در حال بارگیری", "Loading"], "Ready": ["آماده", "Ready"], "Preparation Complete": ["آماده‌سازی کامل", "Prep complete"], "Boarding": ["سوارشدن", "Boarding"], "Hold": ["توقف", "On hold"], "Completed": ["انجام‌شده", "Completed"], "Cancelled": ["لغو شد", "Cancelled"] },
    alerts_none: ["اعلانی ندارید.", "No alerts."], enable_n: ["فعال‌کردن اعلان روی گوشی", "Enable phone notifications"], n_on: ["اعلان‌ها روی این دستگاه فعال است.", "Notifications are on for this device."], clear: ["پاک‌کردن همه", "Clear all"],
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
    wx_t: ["وضعیت جوی", "Weather"], wx_temp: ["دما", "Temperature"], wx_wind: ["باد", "Wind"], wx_gust: ["تندباد", "Gusts"], wx_dir: ["جهت باد", "Direction"], wx_cloud: ["ابر", "Cloud"], wx_vis: ["دید", "Visibility"], wx_note: ["اطلاعات تقریبی است و جای تصمیم مسئول پرواز را نمی‌گیرد", "Approximate; it does not replace the jump operations decision"],
    sos_text: ["با زدن «ارسال»، موقعیت مکانی شما برای مسئولان Manifest فرستاده می‌شود. اگر مشکلی پیش آمده یا بیرون از محل فرود نشسته‌اید (آف‌لندینگ)، از این موقعیت برای پیدا کردن شما استفاده می‌شود. فقط در شرایط واقعی بزنید.", "When you press Send, your location is sent to the Manifest staff. If something went wrong or you landed away from the drop zone (off-landing), they will use it to find you. Use it only in a real situation."],
    sos_send: ["ارسال موقعیت SOS", "Send SOS location"], sos_done: ["SOS برای مسئولان ارسال شد. در صورت امکان تلفن همراهتان را کنار خود نگه دارید.", "SOS was sent to the staff. Keep your phone with you if possible."], sos_nopos: ["موقعیت مکانی در دسترس نبود؛ لطفاً دسترسی موقعیت را برای مرورگر روشن کنید.", "Location was not available; please allow location access for your browser."], cancel: ["انصراف", "Cancel"], close: ["بستن", "Close"],
    edit: ["ویرایش", "Edit"], review: ["بررسی تغییرات", "Review changes"], rev_h: ["تغییرات شما را تأیید می‌کنید؟", "Do you confirm your changes?"], rev_note: ["بعد از تأیید، تغییرات برای مسئول ارسال می‌شود و پس از اعمال در پرونده به شما خبر داده می‌شود.", "After you confirm, the changes go to the staff and you are notified once they are applied to your record."], confirm_send: ["تأیید و ارسال", "Confirm & send"], edit_sent: ["تغییرات برای مسئول ارسال شد.", "Your changes were sent to the staff."], no_change: ["تغییری ایجاد نکرده‌اید.", "You have not changed anything."],
    k_first_fa: ["نام (فارسی)", "First name (Persian)"], k_last_fa: ["نام خانوادگی (فارسی)", "Last name (Persian)"], k_father_fa: ["نام پدر (فارسی)", "Father's name (Persian)"], k_first_en: ["نام (انگلیسی)", "First name (English)"], k_last_en: ["نام خانوادگی (انگلیسی)", "Last name (English)"], k_father_en: ["نام پدر (انگلیسی)", "Father's name (English)"], k_ename_fa: ["نام تماس اضطراری (فارسی)", "Contact name (Persian)"], k_ename_en: ["نام تماس اضطراری (انگلیسی)", "Contact name (English)"],
    k_xlic: ["لایسنس‌های دیگر", "Other licenses"], add_lic: ["افزودن لایسنس", "Add license"], k_mainm: ["مدل کنوپی اصلی", "Main canopy model"], k_mains: ["سایز کنوپی اصلی", "Main canopy size"],
    lic_main: ["لایسنس اصلی", "Main license"], lic_n: ["لایسنس", "License"], mem_h: ["عضویت", "Membership"],
    log_none: ["هنوز پرشی در لاگ‌بوک شما ثبت نشده است.", "No jumps in your logbook yet."], log_total: ["تعداد پرش‌های ثبت‌شده", "Recorded jumps"], log_date: ["تاریخ", "Date"], log_load: ["لود", "Load"], log_ac: ["هواپیما", "Aircraft"], log_type: ["نوع پرش", "Type"], log_alt: ["ارتفاع", "Alt"]
  });
  function tx(k) { var v = TX[k]; return v ? v[L === "fa" ? 0 : 1] : k; }
  function fmt(s, o) { return String(s).replace(/\{(\w+)\}/g, function (_, k) { return o[k] === undefined ? "" : o[k]; }); }
  var FAD = "۰۱۲۳۴۵۶۷۸۹";
  function D(v) { v = v === null || v === undefined ? "" : String(v).replace(/[۰-۹]/g, function (d) { return FAD.indexOf(d); }).replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }); return L === "fa" ? v.replace(/\d/g, function (d) { return FAD[+d]; }) : v; }
  function esc(s) { return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- dates ---------- */
  function g2j(gy, gm, gd) { var gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]; var gy2 = gm > 2 ? gy + 1 : gy; var days = 355666 + 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + gdm[gm - 1]; var jy = -1595 + 33 * Math.floor(days / 12053); days %= 12053; jy += 4 * Math.floor(days / 1461); days %= 1461; if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; } var jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30); var jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30); return [jy, jm, jd]; }
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
  function unreadMsgs() { return S.msgs.filter(function (m) { return m.staff && !m.read; }).length + S.dm.filter(function (m) { return !m.mine && !m.read; }).length; }
  function unreadStaff() { return S.msgs.filter(function (m) { return m.staff && !m.read; }).length; }
  function unreadPeer(id) { return S.dm.filter(function (m) { return m.peer === id && !m.mine && !m.read; }).length; }
  function addNote(id, key, vars, icon) {
    if (S.notes.some(function (n) { return n.id === id; })) return;
    S.notes.unshift({ id: id, key: key, vars: vars || {}, icon: icon || "🔔", at: Date.now(), read: false });
    saveNotes();
    if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.hidden) {
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
  function refreshLoads() { return authed("jumper_loads").then(function (d) { S.loads = d || []; S.loadedAt = Date.now(); detectEvents(); }).catch(function () {}); }
  function refreshMe() { return authed("jumper_me").then(function (d) { var sig = JSON.stringify(d), changed = sig !== S.meSig; S.meSig = sig; S.me = d; detectExpiry(); if (d && d.found && d.hasPhoto && !S.photo) { authed("jumper_photo").then(function (p) { S.photo = p || ""; render(); }).catch(function () {}); } return changed; }).catch(function () { return false; }); }
  function refreshMsgs() { return authed("jumper_messages_list").then(function (d) { S.msgs = d || []; detectMessages(); if (S.tab === "msgs" && S.peer === "staff" && !document.hidden && unreadStaff() > 0) { authed("jumper_mark_read").then(function () { S.msgs.forEach(function (m) { if (m.staff) m.read = true; }); updateBadges(); }).catch(function () {}); } }).catch(function () {}); }

  function refreshDm() {
    return authed("jumper_dm_list").then(function (d) {
      S.dm = d || []; var seen = lsGet("mj_seen_dm", 0), max = seen;
      S.dm.forEach(function (m) { if (!m.mine && m.id > seen) addNote("dm-" + m.id, "n_dm", {}, "💬"); if (m.id > max) max = m.id; });
      if (!(seen === 0 && S.dm.length === 0)) lsSet("mj_seen_dm", max);
      if (S.tab === "msgs" && S.peer && S.peer !== "staff" && S.peer !== "pick" && !document.hidden && unreadPeer(S.peer) > 0) { var pr = S.peer; authed("jumper_dm_read", { p_peer: pr }).then(function () { S.dm.forEach(function (m) { if (m.peer === pr && !m.mine) m.read = true; }); updateBadges(); }).catch(function () {}); }
    }).catch(function () {});
  }
  function refreshPeers() { return authed("jumper_people").then(function (d) { S.peers = d || []; }).catch(function () {}); }
  function peerName(id) { for (var i = 0; i < S.peers.length; i++) if (S.peers[i].id === id) { var p = S.peers[i]; return (L === "fa" ? p.fa || p.en : p.en || p.fa) || "—"; } return "—"; }
  function initials(n) { var w = String(n).split(/\s+/).filter(Boolean); return ((w[0] || "?").charAt(0) + (w[1] ? w[1].charAt(0) : "")).toUpperCase(); }
  var dmPinging = false;
  function dmPing() {
    if (dmPinging || document.hidden || !S.sess) return; dmPinging = true;
    authed("jumper_dm_ping").then(function (r) { dmPinging = false; if (!r) return; var sig = r.id + ":" + r.rd; if (sig !== S.pd) { S.pd = sig; refreshDm().then(softRender); } }).catch(function () { dmPinging = false; });
  }
  function isDm() { return S.peer && S.peer !== "staff" && S.peer !== "pick"; }
  function curMsgs() {
    if (!isDm()) return S.msgs;
    return S.dm.filter(function (m) { return m.peer === S.peer; }).map(function (m) { return { id: m.id + 1000000000, staff: !m.mine, body: m.body, attach: m.attach, at: m.at, read: m.read, seen: m.read, name: "" }; });
  }
  function chatPost(body, attach) {
    if (!isDm()) return sendMsg(body, attach);
    return authed("jumper_dm_send", { p_peer: S.peer, p_body: body, p_attach: attach || null }).then(function () { return refreshDm(); }).then(function () { render(); });
  }
  function openChat(p) {
    S.peer = p; S.anim = true; S.sel = 0; S.popAfter = 0;
    var cm = curMsgs(); S.popAfter = cm.length ? cm[cm.length - 1].id : 0;
    if (p === "staff") authed("jumper_mark_read").then(function () { S.msgs.forEach(function (m) { m.read = true; }); updateBadges(); }).catch(function () {});
    else if (p !== "pick" && p) authed("jumper_dm_read", { p_peer: p }).then(function () { S.dm.forEach(function (m) { if (m.peer === p && !m.mine) m.read = true; }); updateBadges(); }).catch(function () {});
    render(); window.scrollTo(0, 0);
    if (p === "pick") refreshPeers().then(function () { var l = document.getElementById("plist"); if (l) l.innerHTML = pickList(); });
  }
  function refreshAll() { return Promise.all([refreshMe(), refreshLoads(), refreshMsgs(), refreshDm(), refreshPeers()]).then(function () { render(); }); }
  var pinging = false;
  function ping() {
    if (document.hidden || !S.sess || pinging) return; pinging = true;
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
    timers.push(setInterval(ping, 3000));
    timers.push(setInterval(function () { if (!document.hidden && S.sess) refreshMe().then(function (ch) { if (ch) softRender(); }); }, 30000));
    timers.push(setInterval(function () { if (!document.hidden && S.sess) loadWeather().then(softRender); }, 600000));
    timers.push(setInterval(function () { if (!document.hidden && S.sess && S.view === "f_log") refreshLog().then(function (ch) { if (ch) softRender(); }); }, 60000));
    timers.push(setInterval(tickCountdowns, 1000));
    loadWeather().then(softRender);
  }
  function stopPolling() { timers.forEach(clearInterval); timers = []; }
  document.addEventListener("visibilitychange", function () { if (!document.hidden && S.sess) refreshAll(); });
  var lastScroll = 0, srT = 0; window.addEventListener("scroll", function () { lastScroll = Date.now(); }, { passive: true });
  function softRender() { if (Date.now() - lastScroll < 350) { clearTimeout(srT); srT = setTimeout(softRender, 380); return; } if (S.tab === "msgs" && S.sess && document.getElementById("thr")) { updateThread(); updateBadges(); return; } var a = document.activeElement; if (a && (a.tagName === "TEXTAREA" || a.tagName === "INPUT" || a.tagName === "SELECT")) { updateBadges(); return; } render(); }
  function tickCountdowns() { var els = document.querySelectorAll("[data-end]"); for (var i = 0; i < els.length; i++) { var end = +els[i].getAttribute("data-end"); els[i].textContent = mmss((end - Date.now()) / 1000); } detectEvents(); }
  function updateBadges() { var b = document.querySelectorAll(".badge[data-b]"); for (var i = 0; i < b.length; i++) { var k = b[i].getAttribute("data-b"); var n = k === "alerts" ? unreadNotes() : unreadMsgs(); b[i].textContent = D(n); b[i].style.display = n ? "" : "none"; } }

  /* ---------- actions ---------- */
  function setLang(l) { L = l; lsSet(LSK.lang, l); document.documentElement.lang = l; document.documentElement.dir = l === "fa" ? "rtl" : "ltr"; render(); }
  function toast(t) { S.toast = t; render(); setTimeout(function () { if (S.toast === t) { S.toast = ""; render(); } }, 3200); }
  function signOut(silent) { if (S.sess && !silent) rpc("jumper_logout", { p_token: S.sess.token }).catch(function () {}); S.sess = null; S.me = null; S.loads = null; S.msgs = []; S.dm = []; S.peers = []; S.peer = ""; S.pd = undefined; S.photo = ""; S.view = ""; S.edit = null; S.modal = ""; S.sos = null; S.log = null; S.logSig = ""; S.meSig = ""; S.pf = S.pm = S.ps = S.pg = undefined; S.pend = []; S.sel = 0; S.img = ""; try { localStorage.removeItem(LSK.sess); sessionStorage.removeItem(LSK.sess); } catch (e) { /* ignore */ } stopPolling(); render(); }
  function doLogin(u, p, remember) {
    S.err = ""; if (!u || !p) { S.err = tx("fill"); return render(); }
    S.busy = true; render();
    var latin = u.replace(/[۰-۹]/g, function (d) { return FAD.indexOf(d); }).replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }).trim();
    rpc("jumper_login", { p_user: latin, p_pass: p }).then(function (r) {
      S.sess = { token: r.token, username: r.username }; if (r.must_change) { S.sess.mustChange = true; S.tempOld = p; S.tab = "me"; S.view = "f_pw"; } saveSess(S.sess, remember); S.busy = false; if (!S.sess.mustChange) S.tab = "loads"; localStorage.removeItem(LSK.prev); render(); refreshAll().then(startPolling);
    }).catch(function (e) { S.busy = false; var c = (e.code || "").replace(/^.*?(bad_login|locked|pending|net).*$/, "$1"); S.err = tx(["bad_login", "locked", "pending", "net"].indexOf(c) >= 0 ? c : "fail"); render(); });
  }
  function setTab(t) { S.tab = t; S.view = ""; lsSet(LSK.tab, t); if (t === "alerts") { S.notes.forEach(function (n) { n.read = true; }); saveNotes(); } if (t === "msgs") S.peer = ""; S.anim = true; render(); window.scrollTo(0, 0); }
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
    var l = x.l, mine = isMine(l), key = x.date + "#" + l.n, slots = l.slots || [], free = Math.max(0, (l.cap || 0) - slots.length);
    var h = '<div class="card ld' + (mine ? " mine" : "") + '"><div class="row"><div class="grow"><div class="ld-title">' + tx("load") + " " + D(l.n) + "</div></div>" + (mine ? '<span class="chip me">' + tx("onload") + "</span>" : "") + chipFor(l.st) + "</div>";
    if (l.cs === "Running" && l.end && remaining(l) > 0) h += '<div class="row" style="margin-top:8px"><span class="count" data-end="' + l.end + '">' + mmss(remaining(l)) + '</span><span class="muted">' + tx("leaves") + "</span></div>";
    else if (l.cs === "Hold" && l.rem) h += '<div class="row" style="margin-top:8px"><span class="count">' + mmss(l.rem) + '</span><span class="muted">' + chipFor("Hold") + "</span></div>";
    h += loadInfoGrid(l, free);
    h += '<button class="btn sm wide" data-act="openload" data-key="' + esc(key) + '">👥 ' + tx("names") + " (" + D(slots.length) + ")</button></div>";
    return h;
  }
  function findLoad(key) { var all = loadsFlat(); for (var i = 0; i < all.length; i++) if (all[i].date + "#" + all[i].l.n === key) return all[i]; return null; }
  function loadModal() {
    var x = S.modal && findLoad(S.modal); if (!x) return "";
    var l = x.l, slots = l.slots || [], free = Math.max(0, (l.cap || 0) - slots.length);
    var h = '<div class="modal" data-act="closemodal"><div class="sheet"><div class="row"><div class="grow"><div class="ld-title">' + tx("load") + " " + D(l.n) + "</div></div>" + chipFor(l.st) + '<button class="iconbtn" data-act="closemodal">✕</button></div>';
    if (l.cs === "Running" && l.end && remaining(l) > 0) h += '<div class="row" style="margin:6px 0"><span class="count" data-end="' + l.end + '">' + mmss(remaining(l)) + '</span><span class="muted">' + tx("leaves") + "</span></div>";
    h += loadInfoGrid(l, free) + '<div class="h2">' + tx("names") + "</div>";
    h += slots.length ? '<div class="plist">' + slots.map(function (s, i) {
      var nm = L === "fa" ? (s.fa || s.en) : (s.en || s.fa), me = S.me && s.u === S.me.uid;
      return '<div class="pl' + (me ? " me" : "") + '"><div class="pn">' + D(i + 1) + '</div><div class="grow"><b>' + esc(nm || "") + (me ? " · " + tx("you") : "") + '</b><div class="muted">' + tx("g_lic") + ": " + esc(D(s.lic || "—")) + '</div><div class="muted">' + tx("g_jt") + ": " + esc(s.jt || "—") + (s.d ? " · " + esc(s.d) : "") + '</div></div><div class="pa"><span>' + tx("g_alt") + "</span><b>" + (s.alt ? D(s.alt) : "—") + "</b></div></div>";
    }).join("") + "</div>" : '<p class="muted">' + tx("none_on") + "</p>";
    return h + "</div></div>";
  }
  function viewLoads() {
    var all = loadsFlat(), today = todayTehran(), todays = all.filter(function (x) { return x.date === today; });
    var mine = todays.filter(function (x) { return isMine(x.l); }), h = "";
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
      var url = "https://api.open-meteo.com/v1/forecast?latitude=" + w.lat + "&longitude=" + w.lon + "&current=temperature_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m,cloud_cover,precipitation,weather_code,visibility&wind_speed_unit=kn&timezone=auto";
      return fetch(url).then(function (r) { return r.json(); }).then(function (j) { if (j && j.current) { S.wx = j.current; S.wxAt = Date.now(); } });
    }).catch(function () {});
  }
  function weatherCard() {
    var w = S.wxPlace || CFG.wx || { name: "" }, c = S.wx;
    var h = '<div class="card wx2"><div class="wx2-top"><div class="wxi">' + (c ? (WX[c.weather_code] || WX[3])[0] : "⛅") + '</div><div class="wx2-t"><b>' + (c ? '<span dir="ltr">' + D(Math.round(c.temperature_2m)) + "°C</span>" : "—") + '</b><span>' + (c ? (WX[c.weather_code] || WX[3])[L === "fa" ? 1 : 2] : "…") + '</span></div><div class="wx2-place"><b>' + (w.name ? esc(w.name) : tx("wx_t")) + '</b>' + (c ? "<small>" + clockTxt(S.wxAt) + "</small>" : "") + '</div></div>';
    if (c) {
      var dir = DIRS[Math.round((c.wind_direction_10m || 0) / 45) % 8][L === "fa" ? 0 : 1];
      function cell(icn, lab, val) { return '<div class="wx2-c"><span class="wx2-i">' + ic(icn) + '</span><b dir="ltr">' + val + '</b><small>' + lab + "</small></div>"; }
      var kt = ' <span dir="ltr">kt</span>';
      h += '<div class="wx2-grid">' + cell("wind", tx("wx_wind"), D(Math.round(c.wind_speed_10m)) + kt) + cell("wind", tx("wx_gust"), D(Math.round(c.wind_gusts_10m)) + kt) + cell("compass", tx("wx_dir"), dir + " " + D(Math.round(c.wind_direction_10m || 0)) + "&deg;") + cell("cloud", tx("wx_cloud"), D(Math.round(c.cloud_cover)) + "%") + cell("eye", tx("wx_vis"), c.visibility != null ? D(Math.round(c.visibility / 100) / 10) + ' <span dir="ltr">km</span>' : "—") + "</div>";
      h += '<div class="muted wx2-note">' + tx("wx_note") + "</div>";
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
  function viewAlerts() {
    var h = weatherCard();
    if (typeof Notification !== "undefined") h += Notification.permission === "granted" ? '<p class="muted">' + tx("n_on") + "</p>" : '<button class="btn sm" data-act="notif" style="margin-bottom:12px">🔔 ' + tx("enable_n") + "</button>";
    if (!S.notes.length) return h + '<div class="empty">' + tx("alerts_none") + "</div>";
    h += S.notes.map(function (n) { return '<div class="note"><div class="ni">' + n.icon + '</div><div class="grow">' + esc(noteText(n)) + '<div class="muted">' + dateTxt(new Date(n.at).toISOString().slice(0, 10)) + " " + clockTxt(n.at) + "</div></div></div>"; }).join("");
    return h + '<button class="btn sm" data-act="clearnotes">' + tx("clear") + "</button>";
  }
  /* ---------- chat (WhatsApp-style) ---------- */
  var CHAT_URL = CFG.url + "/storage/v1/object/public/chat-files/";
  var AUD = {}, recTimer = 0;
  S.pend = []; S.rec = null; S.sel = 0; S.img = "";
  var OKTYPE = /^(image\/(jpeg|png|webp|gif)|audio\/(webm|ogg|mp4|mpeg|aac|x-m4a|wav)|video\/(mp4|webm)|application\/(pdf|zip|msword|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet))|text\/plain)$/;
  function fileUrl(a) { return CHAT_URL + String(a.path).split("/").map(encodeURIComponent).join("/"); }
  function sizeTxt(n) { return !n ? "" : n > 1048576 ? D((n / 1048576).toFixed(1)) + " MB" : D(Math.max(1, Math.round(n / 1024))) + " KB"; }
  function dayKey(at) { return new Date(new Date(at).getTime() + 3.5 * 3600 * 1000).toISOString().slice(0, 10); }
  function dayLabel(k) { var t = todayTehran(); if (k === t) return tx("today"); var y = new Date(Date.parse(t + "T12:00:00Z") - 86400000).toISOString().slice(0, 10); return k === y ? tx("yesterday") : dateTxt(k); }
  function bubble(m, pop) {
    var a = m.attach, inner = "", mine = !m.staff;
    if (a && a.kind === "chat") {
      var u = fileUrl(a);
      if (a.type === "image") inner += '<img class="cimg" src="' + esc(u) + '" alt="" loading="lazy" data-act="viewimg" data-u="' + esc(u) + '">';
      else if (a.type === "voice") inner += '<div class="vox" data-id="' + m.id + '"><button type="button" class="vplay" data-act="play" data-id="' + m.id + '">▶</button><div class="vbar"><i></i></div><span class="vdur">' + mmss(a.dur || 0) + "</span></div>";
      else inner += '<a class="cfile" href="' + esc(u) + '" target="_blank" rel="noopener"><span class="fi">📄</span><span class="fn">' + esc(a.name || "file") + '</span><small>' + sizeTxt(a.size) + "</small></a>";
    } else if (a && a.kind === "sos") inner += '<div class="sysmsg">🆘 ' + tx("sys_sos") + "</div>";
    else if (a && a.kind === "edit") inner += '<div class="sysmsg">✏️ ' + tx("sys_edit") + "</div>";
    else if (a && a.kind === "reset") inner += '<div class="sysmsg">🔑 ' + tx("sys_reset") + "</div>";
    else if (a) inner += '<div class="sysmsg">📎 ' + esc(a.name || "") + "</div>";
    if (m.body && !(a && (a.kind === "sos") && /^🆘/.test(m.body))) inner += '<span class="mtxt">' + esc(m.body) + "</span>";
    var tick = mine ? '<span class="tick' + (m.seen ? " seen" : "") + '">' + (m.seen ? "✓✓" : "✓") + "</span>" : "";
    var del = mine && S.sel === m.id && (!a || a.kind === "chat") ? '<button type="button" class="mdel" data-act="msgdel" data-id="' + m.id + '">🗑 ' + tx("del_msg") + "</button>" : "";
    return '<div class="msg ' + (m.staff ? "staff" : "mine") + (S.sel === m.id ? " sel" : "") + (pop ? " pop" : "") + '"' + (mine ? ' data-act="msgsel" data-id="' + m.id + '"' : "") + ">" + (m.staff && S.peer === "staff" ? '<b class="who">' + tx("chat_title") + "</b>" : "") + inner + '<small><span>' + clockTxt(new Date(m.at).getTime()) + "</span>" + tick + "</small>" + del + "</div>";
  }
  function threadHtml() {
    var h = "", last = "";
    var cm = curMsgs(), mx = S.popAfter; cm.forEach(function (m) { var k = dayKey(m.at); if (k !== last) { last = k; h += '<div class="dsep"><span>' + dayLabel(k) + "</span></div>"; } h += bubble(m, m.id > S.popAfter); if (m.id > mx) mx = m.id; }); S.popAfter = mx;
    S.pend.forEach(function (p) { h += '<div class="msg mine pend"><span class="mtxt">⏳ ' + esc(p.label) + "</span></div>"; });
    return h || '<div class="empty">' + tx(isDm() ? "dm_hello" : "msg_none") + "</div>";
  }
  function voxRefresh() { Object.keys(AUD).forEach(function (k) { voxUpdate(+k); }); }
  function updateThread() {
    var th = document.getElementById("thr"); if (!th) return;
    var near = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 160;
    th.innerHTML = threadHtml(); voxRefresh();
    if (near && th.lastElementChild) th.lastElementChild.scrollIntoView({ block: "end" });
  }
  function composeHtml() {
    if (!S.peer || S.peer === "pick") return "";
    if (S.rec) return '<div class="compose rec"><button type="button" class="cbtn" data-act="recx" title="✕">🗑</button><span class="rdot"></span><b id="rt" class="ltr">' + mmss((Date.now() - S.rec.t0) / 1000) + '</b><span class="grow"></span><button type="button" class="cbtn send" data-act="recsend">➤</button></div>';
    return '<form class="compose" id="mf" autocomplete="off"><label class="cbtn" title="📎">📎<input type="file" id="cf" hidden accept="image/*,application/pdf,audio/*,video/mp4,.doc,.docx,.xls,.xlsx,.zip,.txt"></label><label class="cbtn" title="📷">📷<input type="file" id="cc" hidden accept="image/*" capture="environment"></label><textarea id="mt" rows="1" maxlength="1000" placeholder="' + esc(tx("msg_ph")) + '"></textarea><button type="submit" class="cbtn send" id="msend" hidden>➤</button><button type="button" class="cbtn mic" id="mmic" data-act="rec">🎙</button></form>';
  }

  function lastOf(arr) { return arr.length ? arr[arr.length - 1] : null; }
  function prevTxt(m) { if (!m) return ""; var a = m.attach; if (a && a.kind === "chat") return a.type === "image" ? "📷 " + tx("photo_lbl") : a.type === "voice" ? "🎙 " + tx("voice_lbl") : "📄 " + (a.name || ""); if (a && a.kind === "sos") return "🆘 SOS"; return m.body || ""; }
  function pickList() {
    var q = (S.pq || "").toLowerCase(), h = "";
    S.peers.forEach(function (p) { var n = (L === "fa" ? p.fa || p.en : p.en || p.fa) || ""; if (q && (p.fa + " " + p.en).toLowerCase().indexOf(q) < 0) return; h += '<button type="button" class="crow" data-act="openchat" data-p="' + esc(p.id) + '"><span class="av">' + esc(initials(n)) + '</span><span class="grow"><b>' + esc(n) + "</b></span></button>"; });
    return h || '<div class="empty">' + tx("dm_none") + "</div>";
  }
  function viewChatList() {
    var lm = lastOf(S.msgs), nS = unreadStaff();
    var h = '<button type="button" class="sosrow" data-act="sos"><span class="sosb">SOS</span><span class="grow"><b>' + tx("sos_btn_t") + '</b><small>' + tx("sos_sub") + '</small></span></button><div class="h2">' + tx("dm_title") + '</div><div class="clist">';
    h += '<button type="button" class="crow pin" data-act="openchat" data-p="staff"><span class="av logo"><img src="logo.png" alt=""></span><span class="grow"><b>' + tx("chat_title") + '</b><small>' + esc(prevTxt(lm) || tx("chat_sub")) + '</small></span>' + (nS ? '<span class="cbadge">' + D(nS) + "</span>" : "") + "</button>";
    var by = {}, order = [];
    S.dm.forEach(function (m) { if (!by[m.peer]) { by[m.peer] = []; } by[m.peer].push(m); });
    order = Object.keys(by).sort(function (a, b) { return lastOf(by[b]).id - lastOf(by[a]).id; });
    order.forEach(function (id) { var l = lastOf(by[id]), n = peerName(id), u = unreadPeer(id); h += '<button type="button" class="crow" data-act="openchat" data-p="' + esc(id) + '"><span class="av">' + esc(initials(n)) + '</span><span class="grow"><b>' + esc(n) + '</b><small>' + (l.mine ? "✓ " : "") + esc(prevTxt(l)) + "</small></span>" + (u ? '<span class="cbadge">' + D(u) + "</span>" : "") + "</button>"; });
    if (!order.length) h += '<div class="empty">' + tx("dm_empty") + "</div>";
    return h + '</div><button type="button" class="fab" data-act="openchat" data-p="pick">' + ic("msgs") + "<span>" + tx("dm_new") + "</span></button>";
  }
  function viewPick() {
    return '<div class="chathead"><button type="button" class="backb" data-act="chatback" aria-label="' + tx("back") + '">' + (L === "fa" ? "→" : "←") + '</button><div><b>' + tx("dm_new") + '</b><small>' + tx("dm_sub") + '</small></div></div><label class="fld"><input id="pq" type="search" autocomplete="off" placeholder="' + esc(tx("dm_search")) + '" value="' + esc(S.pq || "") + '"></label><div class="clist" id="plist">' + pickList() + "</div>";
  }
  function viewMsgs() {
    if (!S.peer) return viewChatList();
    if (S.peer === "pick") return viewPick();
    var nm = S.peer === "staff" ? tx("chat_title") : peerName(S.peer), sb = S.peer === "staff" ? tx("chat_sub") : "", av = S.peer === "staff" ? '<img src="logo.png" alt="">' : '<span class="av">' + esc(initials(nm)) + "</span>";
    return '<div class="chathead"><button type="button" class="backb" data-act="chatback" aria-label="' + tx("back") + '">' + (L === "fa" ? "→" : "←") + "</button>" + av + "<div><b>" + esc(nm) + "</b>" + (sb ? "<small>" + sb + "</small>" : "") + '</div></div><div class="thread" id="thr">' + threadHtml() + '</div><div style="height:96px"></div>' + composeHtml();
  }
  function viewMsgsOld() {
    return '<div class="chathead"><img src="logo.png" alt=""><div><b>' + tx("chat_title") + "</b><small>" + tx("chat_sub") + '</small></div></div><div class="thread" id="thr">' + threadHtml() + '</div><div style="height:96px"></div>' + composeHtml();
  }
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
    loads: '<path d="M3 11a9 9 0 0 1 18 0c-1.5-1.3-3-1.3-4.5 0-1.5-1.3-3-1.3-4.5 0-1.5-1.3-3-1.3-4.5 0C6 9.7 4.5 9.7 3 11z"/><path d="M3 11l7.5 9M21 11l-7.5 9M12 11v9"/><path d="M9.5 20h5"/>',
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
  var FOLDERS = [["f_profile", "f_profile", "var(--orange)"], ["f_cred", "f_cred", "var(--olive)"], ["f_rig", "f_rig", "var(--sky)"], ["f_med", "f_med", "var(--coral)"], ["f_emg", "f_emg", "var(--amber)"], ["f_docs", "f_docs", "var(--teal)"], ["f_log", "f_log", "var(--sky)"], ["f_pw", "f_pw", "var(--violet)"]];

  /* ---------- editing (jumper edits, confirms, staff applies) ---------- */
  var SNAKE = { phone: "phone", email: "email", heightCm: "height_cm", weightKg: "weight_kg", organization: "organization", licenseType: "license_type", licenseNumber: "license_number", membershipExpiry: "membership_expiry", firstJumpDate: "first_jump_date", rigOwnership: "rig_ownership", rigType: "rig_type", mainModel: "main_model", mainSize: "main_size", reserveRepackDate: "reserve_repack_date", emergencyPhone: "emergency_phone", emergencyRelation: "emergency_relation" };
  var OPT = {
    blood: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
    gender: [["Male", "مرد", "Male"], ["Female", "زن", "Female"], ["Other", "سایر", "Other"]],
    org: ["USPA", "BPA", "FAI", "PASA (South Africa)", "CSPA (Canada)", "APF (Australia)", "Iran Air Sports Federation", "Iran Civil Aviation Organization", "Other"],
    lic: ["None", "A", "B", "C", "D", "E"],
    rigown: [["Own", "شخصی", "Own"], ["Rental", "کرایه‌ای", "Rental"]],
    rig: ["Vector 3", "Javelin", "Icon A5", "Mirage", "Wings", "Infinity", "SWS", "Parachute de France", "ParAAvis", "Other"],
    med: ["FAA Medical", "Iran CAO Medical", "Medical Certificate", "Pre-Jump Medical Screening", "Self-Declaration", "Other"],
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
  function optLabel(set, v) { var list = OPT[set]; for (var i = 0; i < list.length; i++) { if (typeof list[i] === "string") { if (list[i] === v) return v; } else if (list[i][0] === v) return list[i][L === "fa" ? 1 : 2]; } return v; }
  function optHtml(set, cur) {
    var list = OPT[set], h = '<option value="">—</option>';
    list.forEach(function (o) { var val = typeof o === "string" ? o : o[0], lab = typeof o === "string" ? o : o[L === "fa" ? 1 : 2]; h += '<option value="' + esc(val) + '"' + (val === cur ? " selected" : "") + ">" + esc(lab) + "</option>"; });
    return h;
  }
  function startEdit(folder) { var vals = {}; EDIT[folder].forEach(function (f) { var v = getVal(f[0]); vals[f[0]] = f[2] === "xl" ? JSON.parse(JSON.stringify(v)) : String(v); }); S.edit = { folder: folder, vals: vals, review: false, err: "" }; render(); window.scrollTo(0, 0); }
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
      else inp = '<input data-ed="' + k + '" type="' + (f[2] === "date" ? "date" : "text") + '" class="' + (f[4] === "ltr" || f[2] !== "text" ? "ltr" : "") + '"' + (f[2] === "num" ? ' inputmode="decimal"' : f[2] === "tel" ? ' inputmode="tel"' : f[2] === "email" ? ' inputmode="email" autocapitalize="off"' : "") + ' value="' + esc(v) + '">';
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
    if (f[2] === "xl") return (v || []).length ? v.map(function (r) { return r.authority + " " + r.number; }).join("، ") : "—";
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
    if (key === "f_profile") return kv([["k_first", L === "fa" ? (e.firstNameFa || p.first_name) : (e.firstNameEn || p.first_name)], ["k_last", L === "fa" ? (e.lastNameFa || p.last_name) : (e.lastNameEn || p.last_name)], ["k_father", L === "fa" ? (e.fatherNameFa || e.fatherName) : (e.fatherNameEn || e.fatherName)], ["k_birth", dateTxt(e.birthDate)], ["k_blood", e.bloodType], ["k_gender", e.gender ? optLabel("gender", e.gender) : ""], ["k_nat", e.nationalityType === "Foreign" ? e.nationalityCountry : (L === "fa" ? "ایرانی" : "Iranian")], ["k_id", e.nationalId || e.passportNumber], ["k_phone", p.phone], ["k_email", p.email], ["k_h", p.height_cm], ["k_w", p.weight_kg]]);
    if (key === "f_cred") {
      var h = '<div class="h2">' + tx("lic_main") + "</div>" + kv([["k_org", p.organization], ["k_ltype", p.license_type], ["k_lno", p.license_number]]);
      (e.extraLicenses || []).forEach(function (x, i) { h += '<div class="h2">' + tx("lic_n") + " " + D(i + 2) + "</div>" + kv([["k_org", x.authority], ["k_lno", x.number]]); });
      return h + '<div class="h2">' + tx("mem_h") + "</div>" + kv([["k_mem", e.membershipNumber], ["k_memx", dateTxt(p.membership_expiry)], ["k_jumps", e.totalJumps], ["k_first_jump", dateTxt(p.first_jump_date)]]);
    }
    if (key === "f_rig") { var due = ""; if (p.reserve_repack_date) { var d = new Date(p.reserve_repack_date + "T12:00:00Z"); if (!isNaN(d)) { d.setUTCDate(d.getUTCDate() + 180); due = d.toISOString().slice(0, 10); } } return kv([["k_rigown", p.rig_ownership === "Rental" ? tx("rental") : tx("own")], ["k_rigtype", p.rig_type], ["k_main", ((p.main_model || "") + " " + (p.main_size || "")).trim()], ["k_repack", dateTxt(p.reserve_repack_date)], ["k_repackdue", dateTxt(due)]]); }
    if (key === "f_med") return kv([["k_medtype", e.medicalType], ["k_medx", dateTxt(e.medicalExpiry)], ["k_inprov", e.insuranceProvider], ["k_inno", e.insurancePolicyNumber], ["k_inx", dateTxt(e.insuranceExpiry)]]);
    if (key === "f_emg") return kv([["k_ename", L === "fa" ? (e.emergencyNameFa || p.emergency_name) : (e.emergencyNameEn || p.emergency_name)], ["k_ephone", p.emergency_phone], ["k_erel", p.emergency_relation ? optLabel("rel", p.emergency_relation) : ""]]);
    return "";
  }
  function logBody() {
    var rows = S.log;
    if (rows === null || rows === undefined) return '<div class="empty">…</div>';
    if (!rows.length) return '<div class="empty">' + tx("log_none") + "</div>";
    var h = '<p class="muted">' + tx("log_total") + ": " + D(rows.length) + '</p><div class="card logt"><div class="lr lh"><span>' + tx("log_date") + "</span><span>" + tx("log_load") + "</span><span>" + tx("log_ac") + "</span><span>" + tx("log_type") + "</span><span>" + tx("log_alt") + "</span></div>";
    rows.forEach(function (r) { h += '<div class="lr"><span>' + dateTxt(r.d) + "</span><span>" + D(r.n) + '</span><span class="ltr">' + esc(r.ac || "—") + "</span><span>" + esc(r.jt || "—") + "</span><span>" + (r.alt ? D(r.alt) : "—") + "</span></div>"; });
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
    h += '<div class="folders">' + FOLDERS.map(function (f) { return '<button class="folder" style="--c:' + f[2] + '" data-folder="' + f[0] + '"><span class="fi">' + ic(f[1]) + "</span><b>" + tx(f[0]) + "</b></button>"; }).join("") + "</div>";
    return h;
  }
  function modalHtml() { return loadModal() + sosModal() + (S.img ? '<div class="imgview" data-act="closeimg"><img src="' + esc(S.img) + '" alt=""><a class="imgopen" href="' + esc(S.img) + '" target="_blank" rel="noopener">⬇</a></div>' : ""); }

  function refreshLog() { return authed("jumper_logbook").then(function (d) { var n = JSON.stringify(d || []); if (n !== S.logSig) { S.logSig = n; S.log = d || []; return true; } return false; }).catch(function () { return false; }); }
  function handleAct(a, t, ev) {
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
    if (a === "chatback") { S.peer = ""; S.anim = true; render(); window.scrollTo(0, 0); return true; }
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
  var BAR = "";
  function viewShell() {
    BAR = ""; var forced = S.sess && S.sess.mustChange; var body = forced ? pwBody() : S.tab === "loads" ? viewLoads() : S.tab === "alerts" ? viewAlerts() : S.tab === "msgs" ? viewMsgs() : viewMe();
    var nA = unreadNotes(), nM = unreadMsgs();
    function tab(k, icn, label, n, b) { return '<button class="' + (S.tab === k ? "on" : "") + '" data-tab="' + k + '"><span class="ti">' + ic(icn) + "</span>" + label + (b ? '<span class="badge" data-b="' + b + '" style="' + (n ? "" : "display:none") + '">' + D(n) + "</span>" : "") + "</button>"; }
    return '<div class="shell' + (S.anim ? " enter" : "") + '"><div class="top"><img src="logo.png" alt=""><b>' + tx("app") + "</b>" + langSwitch() + '<button class="iconbtn" data-act="logout" title="' + tx("logout") + '">' + ic("logout") + '</button></div><div class="page' + (S.anim ? " enter" : "") + '">' + body + "</div>" + (BAR ? '<div class="fixbar">' + BAR + "</div>" : "") +
      (forced ? "" : '<nav class="tabs">' + tab("loads", "loads", tx("t_loads")) + tab("alerts", "alerts", tx("t_alerts"), nA, "alerts") + tab("msgs", "msgs", tx("t_msgs"), nM, "msgs") + tab("me", "user", tx("t_me")) + "</nav>") + modalHtml() + (S.toast ? '<div class="toast">' + esc(S.toast) + "</div>" : "") + "</div>";
  }
  function render() {
    document.documentElement.lang = L; document.documentElement.dir = L === "fa" ? "rtl" : "ltr";
    var keepMsg = document.getElementById("mt") ? document.getElementById("mt").value : "";
    var keepR = document.getElementById("lr") ? document.getElementById("lr").checked : true, keepU = document.getElementById("lu") ? document.getElementById("lu").value : "", keepP = document.getElementById("lp") ? document.getElementById("lp").value : "";
    $app.innerHTML = S.sess ? viewShell() : (S.mode === "forgot" ? viewForgot() : viewLogin());
    if (keepMsg && document.getElementById("mt")) document.getElementById("mt").value = keepMsg;
    if (!S.sess && document.getElementById("lr")) document.getElementById("lr").checked = keepR;
    if (!S.sess) { if (keepU) document.getElementById("lu").value = keepU; if (keepP) document.getElementById("lp").value = keepP; }
    S.anim = false;
    if (S.tab === "msgs" && S.sess && S.peer && S.peer !== "pick") { chatToggle(); voxRefresh(); var th = document.querySelector(".thread"); if (th && th.lastElementChild) th.lastElementChild.scrollIntoView({ block: "end" }); }
  }

  /* ---------- events ---------- */
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-lang],[data-tab],[data-folder],[data-act]"); if (!t) return;
    if (t.dataset.lang) return setLang(t.dataset.lang);
    if (t.dataset.tab) return setTab(t.dataset.tab);
    if (t.dataset.folder) { S.view = t.dataset.folder; S.anim = true; S.err = ""; S.edit = null; if (S.view === "f_log") refreshLog().then(render); render(); return window.scrollTo(0, 0); }
    var a = t.dataset.act;
    if (a && handleAct(a, t, ev)) return;
    if (a === "forgot") { ev.preventDefault(); S.mode = "forgot"; S.err = ""; S.forgotCode = ""; render(); } else if (a === "tologin") { ev.preventDefault(); S.mode = ""; S.err = ""; render(); } else if (a === "back") { S.view = ""; S.edit = null; render(); } else if (a === "logout") signOut(); else if (a === "notif") askNotif(); else if (a === "clearnotes") { S.notes = []; saveNotes(); render(); }
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
      S.edit.err = ""; S.edit.changes = chs; S.edit.review = true; render(); window.scrollTo(0, 0);
    } else if (ev.target.id === "mf") { var ta = document.getElementById("mt"), v = ta.value.trim(); if (!v) return; ta.value = ""; chatToggle(); chatPost(v).catch(function (e) { ta.value = v; toast(/slow_down/.test(e.code || "") ? tx("fail") : tx("fail")); }); }
  });
  function onEditInput(ev) {
    var i = ev.target; if (!i || !i.getAttribute || !S.edit) return;
    if (i.getAttribute("data-bf")) { var bf = i.files && i.files[0]; if (bf && (!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(bf.type) || bf.size > 5 * 1024 * 1024)) { i.value = ""; S.edit.bf = null; return toast(tx("blood_big")); } S.edit.bf = bf || null; var bn = document.querySelector(".bfname"); if (bn) bn.textContent = bf ? bf.name : ""; return; }
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
  render();
  if (S.sess) { refreshAll().then(startPolling); }
})();
