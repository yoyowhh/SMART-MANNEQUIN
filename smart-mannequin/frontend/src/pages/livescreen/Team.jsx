import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Users, GraduationCap, Code2, Cpu, Sparkles, Award } from "lucide-react";

const TeamPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");

  const listDosen = [
    {
      id: "d1",
      name: "Giva Andriana Mutiara, S.T., M.T., Ph.D.",
      role: "Ketua STAS - RG",
      category: "dosen",
      department: "Telkom University",
      image: "/images/stas-rg/anggota/buGiva.jpg",
      highlight: true,
    },
    {
      id: "d2",
      name: "Muhammad Rizqy Alfarisi, S.ST., M.T.",
      role: "Dosen Pembimbing",
      category: "dosen",
      department: "Telkom University",
      image: "/images/stas-rg/anggota/pakAlfa.jpg",
      highlight: true,
    },
    {
      id: "d3",
      name: "Periyadi, S.T., M.T.",
      role: "Dosen Pembimbing",
      category: "dosen",
      department: "Telkom University",
      image: "/images/stas-rg/anggota/Periyadi.jpg",
      highlight: false,
    },
    {
      id: "d4",
      name: "Lisda Meisaroh, S.Si., M.Si.",
      role: "Dosen Pembimbing",
      category: "dosen",
      department: "Telkom University",
      image: "/images/stas-rg/anggota/Lisda.jpg",
      highlight: false,
    },
  ];

  const listMahasiswa = [
    {
      id: "m2",
      name: "Brian Arthur Wiliam A.md.T",
      role: "Hardware Developer",
      category: "hardware",
      image: "/images/stas-rg/anggota/brian.png",
      tag: "Hardware",
    },
    {
      id: "m3",
      name: "Ayumi Clara Setiadi A.md.T",
      role: "Hardware Developer",
      category: "hardware",
      image: "/images/stas-rg/anggota/ayumi.png",
      tag: "Hardware",
    },
    {
      id: "m4",
      name: "Waskito J.A Dawam",
      role: "Hardware Developer",
      category: "hardware",
      image: "/images/stas-rg/anggota/waskito.png",
      tag: "Hardware",
    },
    {
      id: "m5",
      name: "Ahmad Ichlasul Amal A.md.T",
      role: "Hardware Developer",
      category: "hardware",
      image: "/images/stas-rg/anggota/inalsul.jpg",
      tag: "Hardware",
    },
    {
      id: "m6",
      name: "Muhamad Ramadhan Al Bukhori",
      role: "LoRa & Communication Developer",
      category: "iot",
      image: "/images/stas-rg/anggota/al.png",
      tag: "LoRa / IoT",
    },
    {
      id: "m7",
      name: "Muhammad Ghifar Rijali A.md.T",
      role: "Backend Developer",
      category: "software",
      image: "/images/stas-rg/anggota/ghifar.png",
      tag: "Backend",
    },
    {
      id: "m8",
      name: "Irham Kurnia Putra",
      role: "Backend Developer",
      category: "software",
      image: "/images/stas-rg/anggota/Irham.jpeg",
      tag: "Backend",
    },
    {
      id: "m9",
      name: "Muhammad Hasbi Assidiqi",
      role: "Hardware Developer",
      category: "hardware",
      image: "/images/stas-rg/anggota/Hasbi.jpeg",
      tag: "Hardware",
    },
    {
      id: "m10",
      name: "Fauzi",
      role: "Hardware & Sensor Developer",
      category: "hardware",
      image: "/images/stas-rg/anggota/fauzi.jpg",
      tag: "Hardware",
    },
    {
      id: "m11",
      name: "Wildan",
      role: "Firmware Developer",
      category: "iot",
      image: "/images/stas-rg/anggota/wildan.png",
      tag: "Firmware",
    },
    {
      id: "m12",
      name: "Bowo",
      role: "IoT & Embedded Developer",
      category: "iot",
      image: "/images/stas-rg/anggota/bowo.png",
      tag: "IoT",
    },
    {
      id: "m13",
      name: "Nadia",
      role: "Frontend & UI Designer",
      category: "software",
      image: "/images/stas-rg/anggota/nadia.png",
      tag: "Frontend",
    },
    {
      id: "m14",
      name: "Rifqi",
      role: "Research Assistant",
      category: "software",
      image: "/images/stas-rg/anggota/rifqi.png",
      tag: "Research",
    },
    {
      id: "m15",
      name: "Andika",
      role: "Sensor & Hardware Engineer",
      category: "hardware",
      image: "/images/stas-rg/anggota/andika.png",
      tag: "Hardware",
    },
    {
      id: "m16",
      name: "Evansius",
      role: "Hardware Developer",
      category: "hardware",
      image: "/images/stas-rg/anggota/Evansius.jpeg",
      tag: "Hardware",
    },
  ];

  const allMembers = [
    ...listDosen,
    ...listMahasiswa,
  ];

  const filteredMembers =
    activeTab === "all"
      ? allMembers
      : activeTab === "dosen"
      ? listDosen
      : listMahasiswa.filter(
          (m) =>
            m.category === activeTab ||
            (activeTab === "software" && (m.category === "software" || m.category === "iot"))
        );

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white p-8 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-teal-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Informasi Tim Riset & Pengembang
          </h1>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            Daftar dosen pembimbing, peneliti, dan pengembang yang berdedikasi dalam perancangan serta implementasi sistem <strong>Smart Mannequin</strong> dan <strong>Smart Skin</strong> berbasis IoT di Telkom University.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-emerald-100">
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>4 Dosen Pembimbing</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>16+ Mahasiswa & Developer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "all"
              ? "bg-[#00ba88] text-white shadow-md shadow-[#00ba88]/25"
              : "bg-white text-slate-600 hover:bg-slate-50 hover:text-[#00ba88] hover:border-[#00ba88]/40 border border-slate-100 shadow-xs"
          }`}>
          Semua Anggota ({allMembers.length})
        </button>
        <button
          onClick={() => setActiveTab("dosen")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "dosen"
              ? "bg-[#00ba88] text-white shadow-md shadow-[#00ba88]/25"
              : "bg-white text-slate-600 hover:bg-slate-50 hover:text-[#00ba88] hover:border-[#00ba88]/40 border border-slate-100 shadow-xs"
          }`}>
          Dosen Pembimbing ({listDosen.length})
        </button>
        <button
          onClick={() => setActiveTab("hardware")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "hardware"
              ? "bg-[#00ba88] text-white shadow-md shadow-[#00ba88]/25"
              : "bg-white text-slate-600 hover:bg-slate-50 hover:text-[#00ba88] hover:border-[#00ba88]/40 border border-slate-100 shadow-xs"
          }`}>
          Hardware ({listMahasiswa.filter((m) => m.category === "hardware").length})
        </button>
        <button
          onClick={() => setActiveTab("software")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "software"
              ? "bg-[#00ba88] text-white shadow-md shadow-[#00ba88]/25"
              : "bg-white text-slate-600 hover:bg-slate-50 hover:text-[#00ba88] hover:border-[#00ba88]/40 border border-slate-100 shadow-xs"
          }`}>
          Software & IoT ({listMahasiswa.filter((m) => m.category === "software" || m.category === "iot").length})
        </button>
      </div>

      {/* Section 1: Dosen Pembimbing */}
      {(activeTab === "all" || activeTab === "dosen") && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Dosen Pembimbing & Peneliti</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {listDosen.map((dosen) => (
              <div
                key={dosen.id}
                className="group relative bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:border-[#00ba88] hover:shadow-[0_12px_30px_rgba(0,186,136,0.14)] transition-all duration-300 flex flex-col items-center text-center">
                {dosen.highlight && (
                  <span className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                    <Award className="w-3 h-3 text-amber-600" />
                    Lead
                  </span>
                )}
                <div className="relative mb-4">
                  <img
                    src={dosen.image}
                    alt={dosen.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dosen.name)}&background=00ba88&color=fff&bold=true`;
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-sm">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug mb-1">
                  {dosen.name}
                </h3>
                <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 mb-2">
                  {dosen.role}
                </span>
                <p className="text-xs text-slate-500 mt-auto">{dosen.department}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Mahasiswa & Pengembang */}
      {(activeTab === "all" || activeTab !== "dosen") && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-bold text-slate-900">Mahasiswa & Tim Pengembang</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {(activeTab === "all"
              ? listMahasiswa
              : listMahasiswa.filter(
                  (m) =>
                    m.category === activeTab ||
                    (activeTab === "software" && (m.category === "software" || m.category === "iot"))
                )
            ).map((member) => (
              <div
                key={member.id}
                className="group bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:border-[#00ba88] hover:shadow-[0_12px_30px_rgba(0,186,136,0.14)] transition-all duration-300 flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-slate-100 shadow-sm group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0284c7&color=fff&bold=true`;
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] shadow-sm">
                    {member.category === "hardware" ? (
                      <Cpu className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Code2 className="w-3 h-3 text-cyan-400" />
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1">
                  {member.name}
                </h3>
                <p className="text-xs text-slate-600 font-medium mb-3">{member.role}</p>

                <div className="mt-auto pt-2 w-full border-t border-slate-100 flex items-center justify-center">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      member.category === "hardware"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : member.category === "iot"
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "bg-cyan-50 text-cyan-700 border border-cyan-200"
                    }`}>
                    {member.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;
