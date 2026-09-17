import { db } from "@/lib/db"
import { students, classes } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      rollNo,
      studentId,
      institutionId,
      classLevel,
      section,
      shift,
    } = body

    // Validate input
    if (!name || !rollNo || !studentId || !institutionId || !classLevel) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if class exists for this institution and classLevel
    let classRecord = await db.query.classes.findFirst({
      where: (cls) => 
        eq(cls.institutionId, institutionId) && 
        eq(cls.classLevel, classLevel),
    })

    // If class doesn't exist, create it
    if (!classRecord) {
      const classId = `class_${Date.now()}`
      const className = getClassName(classLevel)
      
      await db.insert(classes).values({
        id: classId,
        institutionId,
        name: className,
        classLevel,
      })

      classRecord = {
        id: classId,
        institutionId,
        name: className,
        classLevel,
        createdAt: new Date(),
      }
    }

    // Add student
    const studentId_db = `student_${Date.now()}`
    const result = await db.insert(students).values({
      id: studentId_db,
      classId: classRecord.id,
      institutionId,
      name,
      rollNo,
      parentPhone: "unknown", // Will be set later if needed
    })

    // Store additional data in localStorage or session if needed
    // For now, just return success
    return Response.json({
      success: true,
      message: "Student added successfully",
      studentId: studentId_db,
      rollNo,
      name,
      studentId_original: studentId,
    })
  } catch (error) {
    console.error("[v0] Error adding student:", error)
    return Response.json(
      { message: "Failed to add student", error: String(error) },
      { status: 500 }
    )
  }
}

function getClassName(classLevel: number): string {
  const classNames: Record<number, string> = {
    1: "Class 1",
    2: "Class 2",
    3: "Class 3",
    4: "Class 4",
    5: "Class 5",
    6: "Class 6",
    7: "Class 7",
    8: "Class 8",
    9: "Class 9",
    10: "Class 10",
    11: "11th",
    12: "12th",
    13: "1st Year",
    14: "2nd Year",
    15: "3rd Year",
    16: "4th Year",
  }
  return classNames[classLevel] || `Class ${classLevel}`
}
