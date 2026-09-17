import { db } from "@/lib/db"
import { students, classes, institutions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request) {
  try {
    // Get all students with their class and institution info
    const allStudents = await db.query.students.findMany({
      with: {
        class: true,
        institution: true,
      },
    })

    // Group students by institution and class
    const grouped: Record<string, any> = {}

    allStudents.forEach((student: any) => {
      const institutionId = student.institutionId
      const institutionName = student.institution?.name || "Unknown"
      const className = student.class?.name || "Unknown Class"
      const classLevel = student.class?.classLevel || 0

      if (!grouped[institutionId]) {
        grouped[institutionId] = {
          id: institutionId,
          name: institutionName,
          type: student.institution?.type || "unknown",
          classes: {},
        }
      }

      if (!grouped[institutionId].classes[classLevel]) {
        grouped[institutionId].classes[classLevel] = {
          name: className,
          classLevel,
          students: [],
        }
      }

      grouped[institutionId].classes[classLevel].students.push({
        id: student.id,
        name: student.name,
        rollNo: student.rollNo,
        parentPhone: student.parentPhone,
      })
    })

    return Response.json({
      success: true,
      students: Object.values(grouped),
      total: allStudents.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching students:", error)
    return Response.json(
      { message: "Failed to fetch students", error: String(error) },
      { status: 500 }
    )
  }
}
