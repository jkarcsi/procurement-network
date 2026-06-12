import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATEGORIES, REGIONS } from "../src/lib/taxonomy";

const db = new PrismaClient();

type SupplierSeed = {
  name: string;
  email: string;
  categories: string[];
  regions: string[];
  nationwide?: boolean;
  certifications?: string;
  description: string;
  phone: string;
  // past activity for ranking
  inviteCount: number;
  responseCount: number;
  avgResponseHours: number | null;
};

const SUPPLIERS: SupplierSeed[] = [
  // Cleaning
  { name: "CleanPro Facility Kft.", email: "ajanlat@cleanpro.hu", categories: ["cleaning"], regions: ["budapest", "pest"], certifications: "ISO 9001", description: "Irodaházak és üzemek napi takarítása 120 fős csapattal.", phone: "+36 1 234 5670", inviteCount: 24, responseCount: 19, avgResponseHours: 9 },
  { name: "Tisztaság Mester Bt.", email: "info@tisztasagmester.hu", categories: ["cleaning"], regions: ["budapest"], description: "Kis- és középirodák rugalmas takarítása, zöld tisztítószerekkel.", phone: "+36 30 111 2233", inviteCount: 11, responseCount: 7, avgResponseHours: 16 },
  { name: "Brillant Clean Zrt.", email: "sales@brillantclean.hu", categories: ["cleaning"], regions: ["budapest", "pest", "fejer"], nationwide: true, certifications: "ISO 9001, ISO 14001", description: "Országos lefedettségű facility cég, multinacionális referenciákkal.", phone: "+36 1 700 8800", inviteCount: 35, responseCount: 24, avgResponseHours: 12 },
  { name: "Alföld Higiénia Kft.", email: "iroda@alfoldhigienia.hu", categories: ["cleaning"], regions: ["csongrad-csanad", "bacs-kiskun", "bekes"], description: "Dél-alföldi ipari és irodai takarítás, élelmiszeripari tapasztalattal.", phone: "+36 62 400 100", inviteCount: 8, responseCount: 6, avgResponseHours: 20 },
  { name: "Nyugat Clean Kft.", email: "ajanlat@nyugatclean.hu", categories: ["cleaning"], regions: ["gyor-moson-sopron", "vas", "veszprem"], description: "Győri központú takarítócég, autóipari beszállítói referenciákkal.", phone: "+36 96 320 450", inviteCount: 14, responseCount: 10, avgResponseHours: 14 },
  // HVAC
  { name: "KlímaTech Service Kft.", email: "szerviz@klimatech.hu", categories: ["hvac"], regions: ["budapest", "pest"], certifications: "NKVH F-Gáz képesítés", description: "VRF és split rendszerek telepítése, karbantartása, 0-24 ügyelettel.", phone: "+36 1 555 1212", inviteCount: 28, responseCount: 23, avgResponseHours: 7 },
  { name: "HűtésPont Bt.", email: "info@hutespont.hu", categories: ["hvac"], regions: ["budapest"], certifications: "NKVH F-Gáz képesítés", description: "Ipari hűtés és klímakarbantartás kisvállalati árazással.", phone: "+36 20 444 5566", inviteCount: 9, responseCount: 5, avgResponseHours: 26 },
  { name: "AirFlow Hungary Zrt.", email: "b2b@airflow.hu", categories: ["hvac"], regions: ["budapest", "fejer", "komarom-esztergom"], nationwide: true, certifications: "NKVH, ISO 9001", description: "Légtechnika és HVAC generálkivitelezés, országos szervizhálózat.", phone: "+36 1 880 9900", inviteCount: 31, responseCount: 21, avgResponseHours: 11 },
  { name: "Debrecen Klíma Kft.", email: "ajanlat@debrecenklima.hu", categories: ["hvac"], regions: ["hajdu-bihar", "szabolcs-szatmar-bereg"], certifications: "NKVH F-Gáz képesítés", description: "Kelet-magyarországi klímaszerviz, ipari csarnok-referenciákkal.", phone: "+36 52 510 200", inviteCount: 12, responseCount: 9, avgResponseHours: 13 },
  { name: "Pannon Hűtéstechnika Kft.", email: "iroda@pannonhutes.hu", categories: ["hvac"], regions: ["zala", "somogy", "veszprem"], description: "Dunántúli hűtés- és klímatechnika, szállodai referenciákkal.", phone: "+36 93 310 870", inviteCount: 6, responseCount: 4, avgResponseHours: 22 },
  // Security guarding
  { name: "Guard Force Security Zrt.", email: "uzlet@guardforce.hu", categories: ["security"], regions: ["budapest", "pest"], nationwide: true, certifications: "Rendőrségi működési engedély", description: "Élőerős őrzés, távfelügyelet és beléptetőrendszerek 800 fős állománnyal.", phone: "+36 1 666 7700", inviteCount: 26, responseCount: 18, avgResponseHours: 10 },
  { name: "Bástya Vagyonvédelem Kft.", email: "info@bastyavedelem.hu", categories: ["security"], regions: ["budapest"], certifications: "Rendőrségi működési engedély", description: "Irodaházi portaszolgálat és recepciós szolgáltatás fővárosi fókusszal.", phone: "+36 30 777 8899", inviteCount: 13, responseCount: 9, avgResponseHours: 18 },
  { name: "Patrol-24 Kft.", email: "ajanlat@patrol24.hu", categories: ["security"], regions: ["borsod-abauj-zemplen", "heves", "hajdu-bihar"], certifications: "Rendőrségi működési engedély", description: "Észak-magyarországi járőrszolgálat és telephelyőrzés.", phone: "+36 46 505 050", inviteCount: 7, responseCount: 5, avgResponseHours: 15 },
  { name: "Szeged Security Bt.", email: "iroda@szegedsecurity.hu", categories: ["security"], regions: ["csongrad-csanad", "bekes"], description: "Dél-alföldi vagyonvédelem, logisztikai központok őrzése.", phone: "+36 62 420 420", inviteCount: 5, responseCount: 3, avgResponseHours: 28 },
  // Occupational safety
  { name: "MunkaSzab Consulting Kft.", email: "iroda@munkaszab.hu", categories: ["occupational-safety", "fire-safety"], regions: ["budapest", "pest"], nationwide: true, certifications: "Munkavédelmi szakmérnök, tűzvédelmi szakvizsga", description: "Munka- és tűzvédelmi átalánydíjas szolgáltatás KKV-knak, 400+ ügyfél.", phone: "+36 1 333 4455", inviteCount: 22, responseCount: 18, avgResponseHours: 8 },
  { name: "SafeWork Hungary Bt.", email: "info@safework.hu", categories: ["occupational-safety"], regions: ["budapest"], certifications: "Munkavédelmi technikus", description: "Kockázatértékelés, oktatások és bejárások rugalmas időpontokban.", phone: "+36 70 222 3344", inviteCount: 10, responseCount: 8, avgResponseHours: 12 },
  { name: "Védőháló Munkavédelem Kft.", email: "ajanlat@vedohalo.hu", categories: ["occupational-safety"], regions: ["gyor-moson-sopron", "komarom-esztergom", "vas"], certifications: "Munkavédelmi szakmérnök", description: "Ipari munkavédelem a Nyugat-Dunántúlon, gyártósori tapasztalattal.", phone: "+36 96 550 660", inviteCount: 9, responseCount: 7, avgResponseHours: 10 },
  { name: "Alföldi Munkabiztonság Kft.", email: "info@alfoldimunkabiztonsag.hu", categories: ["occupational-safety", "fire-safety"], regions: ["hajdu-bihar", "jasz-nagykun-szolnok", "bekes"], certifications: "Munkavédelmi technikus, tűzvédelmi előadó", description: "Munka- és tűzvédelem egy kézből kelet-magyarországi telephelyekre.", phone: "+36 52 410 410", inviteCount: 6, responseCount: 4, avgResponseHours: 19 },
  // Fire safety
  { name: "FireStop Mérnökiroda Kft.", email: "iroda@firestop.hu", categories: ["fire-safety"], regions: ["budapest", "pest"], nationwide: true, certifications: "Tűzvédelmi szakértő, OKF regisztráció", description: "Tűzvédelmi szabályzatok, tűzjelző karbantartás, hatósági képviselet.", phone: "+36 1 444 5566", inviteCount: 18, responseCount: 14, avgResponseHours: 9 },
  { name: "Lángőr Bt.", email: "info@langor.hu", categories: ["fire-safety"], regions: ["budapest"], certifications: "Tűzvédelmi előadó", description: "Tűzoltó készülék felülvizsgálat és tűzvédelmi oktatás kisvállalatoknak.", phone: "+36 20 888 9900", inviteCount: 8, responseCount: 5, avgResponseHours: 21 },
  { name: "Pécs Tűzvédelem Kft.", email: "ajanlat@pecstuzvedelem.hu", categories: ["fire-safety", "occupational-safety"], regions: ["baranya", "somogy", "tolna"], certifications: "Tűzvédelmi szakvizsga", description: "Dél-dunántúli tűz- és munkavédelmi szolgáltató, ipari parki referenciák.", phone: "+36 72 310 310", inviteCount: 5, responseCount: 4, avgResponseHours: 16 },
  // IT support
  { name: "NetMester IT Kft.", email: "sales@netmester.hu", categories: ["it-support"], regions: ["budapest", "pest"], certifications: "Microsoft Partner", description: "Teljes körű IT üzemeltetés 10-200 fős cégeknek, fix havidíjas modellben.", phone: "+36 1 999 0011", inviteCount: 20, responseCount: 16, avgResponseHours: 6 },
  { name: "ITBiztos Kft.", email: "hello@itbiztos.hu", categories: ["it-support"], regions: ["budapest"], nationwide: true, certifications: "Microsoft Partner, ISO 27001", description: "Távoli és helyszíni support, M365 és felhőmigráció KKV fókusszal.", phone: "+36 30 600 7008", inviteCount: 15, responseCount: 12, avgResponseHours: 8 },
  { name: "Görgey Informatika Bt.", email: "info@gorgeyit.hu", categories: ["it-support"], regions: ["hajdu-bihar", "borsod-abauj-zemplen"], description: "Kelet-magyarországi rendszergazda-szolgáltatás, gyors kiszállással.", phone: "+36 52 700 700", inviteCount: 7, responseCount: 5, avgResponseHours: 14 },
];

async function main() {
  console.log("Seeding…");

  for (const cat of CATEGORIES) {
    await db.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, clarifyQuestions: JSON.stringify(cat.clarifyQuestions) },
      create: { id: cat.id, name: cat.name, clarifyQuestions: JSON.stringify(cat.clarifyQuestions) },
    });
  }
  for (const region of REGIONS) {
    await db.region.upsert({
      where: { id: region.id },
      update: { name: region.name },
      create: { id: region.id, name: region.name },
    });
  }

  const passwordHash = await bcrypt.hash("demo1234", 10);

  // Demo buyer
  const buyerCompany = await db.company.upsert({
    where: { id: "demo-buyer-company" },
    update: {},
    create: { id: "demo-buyer-company", name: "Demo Gyártó Kft.", type: "BUYER" },
  });
  await db.user.upsert({
    where: { email: "demo@vevo.hu" },
    update: {},
    create: {
      email: "demo@vevo.hu",
      name: "Kiss Andrea",
      passwordHash,
      role: "BUYER",
      companyId: buyerCompany.id,
    },
  });

  // Starting credits for the demo buyer (only on first seed)
  const hasLedger = await db.creditTransaction.findFirst({
    where: { companyId: buyerCompany.id },
  });
  if (!hasLedger) {
    const updated = await db.company.update({
      where: { id: buyerCompany.id },
      data: { creditBalance: { increment: 25 } },
    });
    await db.creditTransaction.create({
      data: {
        companyId: buyerCompany.id,
        amount: 25,
        balanceAfter: updated.creditBalance,
        type: "BONUS",
        description: "Demo kezdőkreditek",
      },
    });
  }

  // Suppliers
  for (const s of SUPPLIERS) {
    const existing = await db.supplierProfile.findFirst({ where: { email: s.email } });
    if (existing) continue;
    const company = await db.company.create({ data: { name: s.name, type: "SUPPLIER" } });
    await db.supplierProfile.create({
      data: {
        companyId: company.id,
        email: s.email,
        phone: s.phone,
        description: s.description,
        certifications: s.certifications ?? null,
        nationwide: s.nationwide ?? false,
        inviteCount: s.inviteCount,
        responseCount: s.responseCount,
        avgResponseHours: s.avgResponseHours,
        categories: { create: s.categories.map((categoryId) => ({ categoryId })) },
        regions: { create: s.regions.map((regionId) => ({ regionId })) },
      },
    });
  }

  // Demo supplier account (linked to CleanPro)
  const cleanpro = await db.supplierProfile.findFirst({
    where: { email: "ajanlat@cleanpro.hu" },
  });
  if (cleanpro) {
    await db.user.upsert({
      where: { email: "demo@beszallito.hu" },
      update: {},
      create: {
        email: "demo@beszallito.hu",
        name: "Nagy Péter",
        passwordHash,
        role: "SUPPLIER",
        companyId: cleanpro.companyId,
      },
    });
  }

  // Admin account
  await db.user.upsert({
    where: { email: "admin@procura.hu" },
    update: {},
    create: {
      email: "admin@procura.hu",
      name: "Procura Admin",
      passwordHash: await bcrypt.hash("admin1234", 10),
      role: "ADMIN",
    },
  });

  console.log("Seed done.");
  console.log("Demo buyer:    demo@vevo.hu / demo1234");
  console.log("Demo supplier: demo@beszallito.hu / demo1234");
  console.log("Demo admin:    admin@procura.hu / admin1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
