package internal

import (
	"bufio"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/max_kai/military-grade-wg/internal/models"
)

func InteractiveSetup(db *DBManager) {
	reader := bufio.NewReader(os.Stdin)

	fmt.Println("\n\033[1;36m====================================================\033[0m")
	fmt.Println("\033[1;36m   ARMOR-X1 STRATEGIC DEPLOYMENT WIZARD (CLI)   \033[0m")
	fmt.Println("\033[1;36m====================================================\033[0m")
	fmt.Println("ระบบตรวจพบการติดตั้งใหม่ กรุณากรอกข้อมูลเพื่อเริ่มต้นระบบ")

	// 1. Organization Genesis
	fmt.Print("\033[1;33m[1/4] ชื่อองค์กร (Organization Name): \033[0m")
	orgName, _ := reader.ReadString('\n')
	orgName = strings.TrimSpace(orgName)

	org := models.Organization{
		Name:        orgName,
		Description: "Primary Command Center established via CLI",
	}
	db.DB.Create(&org)
	fmt.Printf("\033[1;32m   > Matrix Established: %s\033[0m\n\n", orgName)

	// 2. Admin Commander Identity
	fmt.Println("\033[1;33m[2/4] ตั้งค่าบัญชีผู้บัญชาการสูงสุด (Root Administrator)\033[0m")
	fmt.Print("   Username [admin]: ")
	username, _ := reader.ReadString('\n')
	username = strings.TrimSpace(username)
	if username == "" {
		username = "admin"
	}

	fmt.Print("   Email: ")
	email, _ := reader.ReadString('\n')
	email = strings.TrimSpace(email)

	fmt.Print("   Password: ")
	password, _ := reader.ReadString('\n')
	password = strings.TrimSpace(password)

	hash, _ := HashPassword(password)
	admin := models.User{
		Username:       username,
		Email:          email,
		PasswordHash:   hash,
		Role:           models.RoleRoot,
		Status:         "active",
		OrganizationID: org.ID,
	}
	db.DB.Create(&admin)
	fmt.Printf("\033[1;32m   > Identity Deployed: %s\033[0m\n\n", username)

	// 3. Node Role Selection
	fmt.Println("\033[1;33m[3/4] บทบาทของเครื่องนี้ (Deployment Role)\033[0m")
	fmt.Println("   1) Primary Command Unit (เครื่องหลัก)")
	fmt.Println("   2) Satellite Edge Unit (เครื่องรอง)")
	fmt.Print("   เลือกบทบาท [1]: ")
	roleInput, _ := reader.ReadString('\n')
	roleInput = strings.TrimSpace(roleInput)

	if roleInput == "2" {
		fmt.Println("\n\033[1;35m[SATELLITE_MODE_INITIATED]\033[0m")
		fmt.Println("กรุณานำไฟล์ Join Config หรือ Token ไปใส่ที่เครื่องหลัก")
		fmt.Println("----------------------------------------------------")
		fmt.Printf("TOKEN: %s\n", strings.ToUpper(fmt.Sprintf("%x", time.Now().Unix())))
		fmt.Println("----------------------------------------------------")
	} else {
		fmt.Println("\n\033[1;32m[PRIMARY_MODE_INITIATED]\033[0m")
		fmt.Println("เครื่องนี้ได้รับการตั้งค่าเป็นศูนย์กลางของ Matrix เรียบร้อยแล้ว")
	}

	fmt.Println("\n\033[1;36m====================================================\033[0m")
	fmt.Println("\033[1;32m   MISSION SUCCESS: ARMOR-X1 IS NOW OPERATIONAL   \033[0m")
	fmt.Println("\033[1;36m====================================================\033[0m")
}
