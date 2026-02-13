export const translations = {
    th: {
        sidebar: {
            networkPulse: "สถานะเครือข่าย",
            securityAudit: "ตรวจสอบความปลอดภัย",
            nodeTopology: "ผังเครือข่าย",
            keyManagement: "จัดการกุญแจเข้ารหัส",
            systemSettings: "ตั้งค่าระบบ",
            coreParameters: "พารามิเตอร์หลัก",
            securityPolicy: "นโยบายความปลอดภัย",
            engineOnline: "ระบบออนไลน์",
            nodeSync: "ซิงค์โหนด",
            myAccess: "การเข้าถึงของฉัน",
            gatewayCommand: "กองบัญชาการเกตเวย์",
            identityMatrix: "จัดการทรัพยากรบุคคล"
        },
        header: {
            accessMatrix: "ตารางสิทธิ์การเข้าถึง",
            securityEventLogs: "บันทึกเหตุการณ์ความปลอดภัย",
            gatewayStatus: "เกตเวย์ภายใน V4",
            queryIdentity: "ค้นหาด้วยรหัสตัวตน..."
        },
        stats: {
            activeTunnels: "อุโมงค์ที่เชื่อมต่อ",
            securityEvents: "เหตุการณ์ด้านความปลอดภัย",
            identityMatrix: "ทะเบียนตัวตน",
            coreEngine: "เอนจินหลัก",
            liveConnection: "การเชื่อมต่อจริง",
            auditLogs: "บันทึกการตรวจสอบ",
            totalNodes: "โหนดทั้งหมด",
            encryption: "การเข้ารหัส"
        },
        nodeMatrix: {
            title: "ตารางโหนดที่ได้รับอนุญาต",
            endpoint: "ปลายทางโหนด",
            allocation: "การจัดสรร IP",
            securePulse: "สัญญาณเชื่อมต่อ",
            traffic: "ปริมาณข้อมูล (รับ / ส่ง)",
            interface: "อินเตอร์เฟซ",
            handshake: "การจับมือ",
            incoming: "รับเข้า",
            outgoing: "ส่งออก",
            noDevices: "ไม่พบอุปกรณ์ในเครือข่ายขณะนี้",
            never: "ไม่เคย"
        },
        auditMatrix: {
            title: "บันทึกการตรวจสอบสิทธิ์",
            timestamp: "เวลา",
            identity: "ตัวตน / ทรัพยากร",
            action: "การปฏิบัติการ",
            origin: "ต้นทาง",
            noLogs: "ไม่พบบันทึกในหน่วยความจำ"
        },
        provision: {
            title: "ลงทะเบียนโหนดใหม่",
            tagPlaceholder: "ชื่อโหนด (เช่น ALPHA)",
            registerBtn: "ลงทะเบียนโหนด",
            failure: "ระบบขัดข้อง: ไม่สามารถสร้างการเชื่อมต่อสำหรับ"
        },
        onboarding: {
            accessGranted: "อนุญาตการเข้าถึง",
            singleUseKey: "กุญแจส่วนตัว (แสดงครั้งเดียว)",
            destroyView: "ปิดหน้าต่าง",
            saveMetadata: "บันทึกไฟล์ตั้งค่า"
        },
        analytics: {
            title: "วิเคราะห์ปริมาณข้อมูลเชิงยุทธวิธี",
            trafficFlow: "การไหลเคลื่อนของข้อมูล (Traffic Flow)",
            peakUsage: "ช่วงเวลาใช้งานสูงสุด",
            rxTotal: "ข้อมูลรับเข้ารวม",
            txTotal: "ข้อมูลส่งออกรวม",
            noData: "อยู่ระหว่างการเก็บรวบรวมข้อมูล Telemetry..."
        },
        common: {
            loading: "กำลังโหลด...",
            error: "เอนจินขัดข้อง: ตรวจสอบสถานะลิงก์ความปลอดภัย",
            revocationWarning: "คำเตือน: การเพิกถอนสิทธิ์จะยุติการเชื่อมต่อทั้งหมดของโหนดนี้ทันที ยืนยันหรือไม่?",
            logout: "ออกจากระบบความปลอดภัย"
        },
        userMatrix: {
            title: "ฐานข้อมูลบุคลากร",
            deployBtn: "ลงทะเบียนรหัสตัวตนใหม่",
            roleTier: "ระดับสิทธิ์",
            status: "สถานะระบบ",
            actions: "การปฏิบัติการ",
            purgeWarning: "คำเตือน: การลบตัวตนจะตัดการเข้าถึงทั้งหมดอย่างถาวร ยืนยันหรือไม่?"
        },
        firewall: {
            title: "นโยบายการควบคุมการเข้าถึง (ACL)",
            addRule: "เพิ่มกฎการควบคุม",
            source: "ต้นทาง",
            destination: "ปลายทาง",
            port: "พอร์ต",
            protocol: "โปรโตคอล",
            action: "การตัดสินใจ",
            description: "คำอธิบาย",
            allow: "อนุญาต (ALLOW)",
            deny: "ปิดกั้น (DENY)",
            any: "ทั้งหมด (ANY)",
            noRules: "ยังไม่มีนโยบายการควบคุมที่ตั้งค่าไว้"
        }
    }
};

export type Language = keyof typeof translations;
export const defaultLang: Language = 'th';
