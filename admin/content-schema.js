/* ============================================================================
   Novixel — content schema + defaults
   Defines every field the admin panel can edit, in both public languages
   (English + Spanish). Used by the admin panel and (later) the public site.
   ============================================================================ */
window.NOVIXEL_SCHEMA = {

  /* ---- admin interface strings (admin UI language: Hebrew / English) ---- */
  ui: {
    he: { title:"ניהול Novixel", content:"תוכן האתר", leads:"לידים", logout:"התנתק",
      save:"שמור שינויים", saved:"נשמר ✓", saving:"שומר…", login:"כניסה",
      email:"אימייל", password:"סיסמה", contentLang:"שפת התוכן לעריכה",
      preview:"מצב תצוגה מקדימה — השינויים נשמרים רק בדפדפן הזה. הוסף מפתחות Supabase כדי שזה יעלה לאתר האמיתי.",
      status:"סטטוס", name:"שם", emailCol:"אימייל", type:"תחום", volume:"כמות", date:"תאריך",
      noLeads:"אין עדיין לידים", del:"מחק", confirmDel:"למחוק את הליד?",
      loginErr:"אימייל או סיסמה שגויים", notAdmin:"המשתמש הזה אינו מנהל מורשה",
      st_new:"חדש", st_contacted:"יצרתי קשר", st_booked:"נקבעה פגישה", st_archived:"בארכיון" },
    en: { title:"Novixel Admin", content:"Site content", leads:"Leads", logout:"Log out",
      save:"Save changes", saved:"Saved ✓", saving:"Saving…", login:"Sign in",
      email:"Email", password:"Password", contentLang:"Content language to edit",
      preview:"Preview mode — changes are saved only in this browser. Add your Supabase keys to push to the live site.",
      status:"Status", name:"Name", emailCol:"Email", type:"Industry", volume:"Volume", date:"Date",
      noLeads:"No leads yet", del:"Delete", confirmDel:"Delete this lead?",
      loginErr:"Wrong email or password", notAdmin:"This user is not an authorized admin",
      st_new:"New", st_contacted:"Contacted", st_booked:"Booked", st_archived:"Archived" }
  },

  /* ---- editable site content, grouped (labels shown in admin UI lang) ---- */
  groups: [
    { id:"hero", he:"כותרת ראשית", en:"Hero", fields:[
      { key:"hero.subline", type:"textarea", he:"טקסט תיאור", en:"Subtitle" },
      { key:"cta.primary",  type:"text",     he:"כפתור ראשי", en:"Primary button" },
      { key:"calendly.url", type:"url",      he:"קישור Calendly", en:"Calendly link" }
    ]},
    { id:"pricing", he:"מחירים", en:"Pricing", fields:[
      { key:"price.launch",   type:"text", he:"Launch — לחודש",  en:"Launch — monthly" },
      { key:"setup.launch",   type:"text", he:"Launch — התקנה",  en:"Launch — setup" },
      { key:"price.convert",  type:"text", he:"Convert — לחודש", en:"Convert — monthly" },
      { key:"setup.convert",  type:"text", he:"Convert — התקנה", en:"Convert — setup" },
      { key:"price.dominate", type:"text", he:"Dominate — לחודש",en:"Dominate — monthly" },
      { key:"setup.dominate", type:"text", he:"Dominate — התקנה",en:"Dominate — setup" }
    ]},
    { id:"contact", he:"יצירת קשר", en:"Contact", fields:[
      { key:"contact.email", type:"text", he:"אימייל ליצירת קשר", en:"Contact email" }
    ]},
    { id:"faq", he:"שאלות נפוצות", en:"FAQ", fields:[
      { key:"faq.q1", type:"text",     he:"שאלה 1", en:"Question 1" },
      { key:"faq.a1", type:"textarea", he:"תשובה 1", en:"Answer 1" },
      { key:"faq.q2", type:"text",     he:"שאלה 2", en:"Question 2" },
      { key:"faq.a2", type:"textarea", he:"תשובה 2", en:"Answer 2" },
      { key:"faq.q3", type:"text",     he:"שאלה 3", en:"Question 3" },
      { key:"faq.a3", type:"textarea", he:"תשובה 3", en:"Answer 3" },
      { key:"faq.q4", type:"text",     he:"שאלה 4", en:"Question 4" },
      { key:"faq.a4", type:"textarea", he:"תשובה 4", en:"Answer 4" },
      { key:"faq.q5", type:"text",     he:"שאלה 5", en:"Question 5" },
      { key:"faq.a5", type:"textarea", he:"תשובה 5", en:"Answer 5" }
    ]}
  ],

  /* ---- default values per public locale (English + Spanish) ---- */
  defaults: {
    en: {
      "hero.subline":"Novixel is the AI receptionist that answers, qualifies, and books every lead in seconds — 24/7, with the poise of a flawless front desk that never sleeps.",
      "cta.primary":"Book your free setup call",
      "calendly.url":"https://calendly.com/hello-novixelai",
      "price.launch":"$197","setup.launch":"+ $747 one-time setup",
      "price.convert":"$397","setup.convert":"+ $1,497 one-time setup",
      "price.dominate":"$697","setup.dominate":"+ $2,997 one-time setup",
      "contact.email":"hello@novixel.ai",
      "faq.q1":"Will it sound like a robot?",
      "faq.a1":"No. Novi is trained on your business and brand voice, so replies feel natural and on-message. Most leads can't tell — and a human on your team can step in at any moment.",
      "faq.q2":"What if it can't answer something?",
      "faq.a2":"Novi handles the everyday 90% — pricing ranges, availability, qualifying questions. Anything unusual, it captures the details, sets expectations, and hands off to you with the full context attached.",
      "faq.q3":"How fast can we go live?",
      "faq.a3":"Most setups go live within days. We configure your channels, calendar, scripts and brand voice, test it together, then switch it on — no engineering on your side.",
      "faq.q4":"Which channels does it cover?",
      "faq.a4":"Phone calls, SMS, web chat, web forms, and social DMs — every place a lead might reach you, answered from one system.",
      "faq.q5":"Is my data safe?",
      "faq.a5":"Conversations are encrypted and never sold. You own your data, see every conversation, and can export or delete it anytime."
    },
    es: {
      "hero.subline":"Novixel es la recepcionista con IA que responde, califica y agenda a cada cliente potencial en segundos — 24/7, con la elegancia de una recepción impecable que nunca duerme.",
      "cta.primary":"Reserva tu llamada de configuración gratuita",
      "calendly.url":"https://calendly.com/hello-novixelai",
      "price.launch":"$197","setup.launch":"+ $747 de configuración única",
      "price.convert":"$397","setup.convert":"+ $1,497 de configuración única",
      "price.dominate":"$697","setup.dominate":"+ $2,997 de configuración única",
      "contact.email":"hello@novixel.ai",
      "faq.q1":"¿Sonará como un robot?",
      "faq.a1":"No. Novi se entrena con tu negocio y el tono de tu marca, así que las respuestas se sienten naturales y coherentes. La mayoría de los clientes no lo nota — y una persona de tu equipo puede intervenir en cualquier momento.",
      "faq.q2":"¿Y si no sabe responder algo?",
      "faq.a2":"Novi resuelve el 90% del día a día — rangos de precios, disponibilidad, preguntas de calificación. Ante algo inusual, registra los detalles, gestiona las expectativas y te lo pasa con todo el contexto adjunto.",
      "faq.q3":"¿Qué tan rápido podemos activarlo?",
      "faq.a3":"La mayoría queda activo en pocos días. Configuramos tus canales, calendario, guiones y el tono de tu marca, lo probamos juntos y lo encendemos — sin trabajo técnico de tu parte.",
      "faq.q4":"¿Qué canales cubre?",
      "faq.a4":"Llamadas, SMS, chat web, formularios y mensajes directos en redes — cada lugar donde un cliente pueda contactarte, atendido desde un solo sistema.",
      "faq.q5":"¿Están seguros mis datos?",
      "faq.a5":"Las conversaciones están cifradas y nunca se venden. Tus datos son tuyos: ves cada conversación y puedes exportarla o eliminarla cuando quieras."
    }
  }
};
