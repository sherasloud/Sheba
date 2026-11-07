"use client"

import { useEffect, useState } from "react"
import { upload } from "@vercel/blob/client"
import { FileArchive, Loader2, UploadCloud } from "lucide-react"

export default function AdminAabUpload() {
  const [adminPhone, setAdminPhone] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      setAdminPhone(userData.phoneNumber || userData.phone || "")
    } catch {
      setAdminPhone("")
    }
  }, [])

  const handleUpload = async () => {
    if (!file || !adminPhone) {
      setError("Admin account and an AAB file are required.")
      return
    }

    if (!file.name.toLowerCase().endsWith(".aab")) {
      setError("Only .aab files are accepted.")
      return
    }

    if (file.size > 200 * 1024 * 1024) {
      setError("The AAB file must be smaller than 200 MB.")
      return
    }

    setError("")
    setStatus("")
    setIsUploading(true)

    try {
      const blob = await upload(`android-releases/${Date.now()}-${file.name}`, file, {
        access: "private",
        handleUploadUrl: "/api/admin/aab-upload",
        clientPayload: JSON.stringify({ adminPhone }),
      })
      setStatus(`Uploaded successfully: ${blob.pathname}`)
      setFile(null)
    } catch (uploadError) {
      console.error("[v0] AAB upload failed:", uploadError)
      setError(uploadError instanceof Error ? uploadError.message : "AAB upload failed.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <section className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4" aria-labelledby="aab-upload-title">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-blue-100 p-2 text-[#29a9eb]" aria-hidden="true">
          <FileArchive size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="aab-upload-title" className="font-semibold text-[#142033]">Android App Bundle</h2>
          <p className="mt-1 text-sm text-gray-600">Admin verified: {adminPhone}. Upload a signed .aab release for your Play Store workflow.</p>
          <details className="mt-3 rounded-lg border border-blue-100 bg-white p-3 text-sm text-gray-700">
            <summary className="cursor-pointer font-semibold text-[#142033]">How to get the .aab file</summary>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Open <code>mobile/android</code> in Android Studio.</li>
              <li>Select <strong>Build → Generate Signed Bundle / APK</strong>.</li>
              <li>Select <strong>Android App Bundle</strong> and complete the signing steps.</li>
              <li>Choose the generated <code>app-release.aab</code> file below and upload it.</li>
            </ol>
            <p className="mt-2 text-xs text-gray-500">The file is usually in <code>android/app/build/outputs/bundle/release/</code>.</p>
          </details>
          <label className="mt-3 block cursor-pointer rounded-lg border border-dashed border-blue-300 bg-white p-3 text-sm text-gray-700 hover:bg-blue-50">
            <span className="flex items-center gap-2"><UploadCloud size={18} className="text-[#29a9eb]" />{file ? file.name : "Choose signed .aab file"}</span>
            <input className="sr-only" type="file" accept=".aab,application/vnd.android.package-archive" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </label>
          <button type="button" onClick={handleUpload} disabled={!file || isUploading} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#29a9eb] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
            {isUploading && <Loader2 size={16} className="animate-spin" />}
            {isUploading ? "Uploading..." : "Upload AAB"}
          </button>
          {status && <p className="mt-2 break-words text-sm text-green-700" role="status">{status}</p>}
          {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
        </div>
      </div>
    </section>
  )
}
