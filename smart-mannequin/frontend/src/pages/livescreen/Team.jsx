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

  const hardwareMembers = listMahasiswa.filter((m) => m.category === "hardware" || m.category === "iot");
  const softwareMembers = listMahasiswa.filter((m) => m.category === "software");

  const filteredMahasiswa =
    activeTab === "all"
      ? listMahasiswa
      : activeTab === "hardware"
        ? hardwareMembers
        : activeTab === "software"
          ? softwareMembers
          : [];

  return (
    <div className="w-full max-w-[1700px] mx-auto flex flex-col gap-6">
        {/* Header Banner - Compact & Clean kyk di Visualisasi Manekin */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-white px-6 py-4 sm:py-5 shadow-sm">
          {/* Decorative ambient gradients */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 -mb-10 w-60 h-60 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {t("team.title", "Informasi Tim Riset & Pengembang")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              {t("team.subtitle", "Daftar dosen pembimbing, peneliti, dan pengembang sistem Smart Mannequin dan Smart Skin berbasis IoT di Telkom University.")}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${activeTab === "all"
                ? "bg-[#00ba88] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 hover:text-[#00ba88] hover:border-[#00ba88]/40 border border-slate-100 shadow-2xs"
              }`}>
            {t("team.allMembers", "Semua Anggota")} ({allMembers.length})
          </button>
          <button
            onClick={() => setActiveTab("dosen")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${activeTab === "dosen"
                ? "bg-[#00ba88] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 hover:text-[#00ba88] hover:border-[#00ba88]/40 border border-slate-100 shadow-2xs"
              }`}>
            {t("team.lecturers", "Dosen Pembimbing")} ({listDosen.length})
          </button>
          <button
            onClick={() => setActiveTab("hardware")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${activeTab === "hardware"
                ? "bg-[#00ba88] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 hover:text-[#00ba88] hover:border-[#00ba88]/40 border border-slate-100 shadow-2xs"
              }`}>
            {t("team.hardwareIot", "Hardware & IoT")} ({hardwareMembers.length})
          </button>
          <button
            onClick={() => setActiveTab("software")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${activeTab === "software"
                ? "bg-[#00ba88] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 hover:text-[#00ba88] hover:border-[#00ba88]/40 border border-slate-100 shadow-2xs"
              }`}>
            {t("team.software", "Software")} ({softwareMembers.length})
          </button>
        </div>

        {/* Section 1: Dosen Pembimbing */}
        {(activeTab === "all" || activeTab === "dosen") && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {t("team.lecturers", "Dosen Pembimbing")}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              {listDosen.map((dosen) => (
                <div
                  key={dosen.id}
                  className="group relative bg-white rounded-xl border border-slate-100 p-3.5 shadow-sm hover:border-[#00ba88] hover:shadow-xl hover:shadow-emerald-500/15 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center cursor-default">
                  {dosen.highlight && (
                    <span className="absolute top-2 right-2 bg-amber-50 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-amber-200/70">
                      <Award className="w-2.5 h-2.5 text-amber-500" />
                      Lead
                    </span>
                  )}
                  <div className="relative mb-2.5">
                    <img
                      src={dosen.image}
                      alt={dosen.name}
                      className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover border-2 border-slate-100 shadow-xs group-hover:scale-105 group-hover:border-emerald-200 transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dosen.name)}&background=00ba88&color=fff&bold=true`;
                      }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shadow-xs">
                      <GraduationCap className="w-3 h-3" />
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug mb-1 line-clamp-2" title={dosen.name}>
                    {dosen.name}
                  </h3>
                  <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 mb-1">
                    {dosen.role}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-auto">{dosen.department}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Mahasiswa & Pengembang */}
        {(activeTab === "all" || activeTab !== "dosen") && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Mahasiswa & Tim Pengembang</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredMahasiswa.map((member) => (
                <div
                  key={member.id}
                  className="group bg-white rounded-xl border border-slate-100 p-3 shadow-sm hover:border-[#00ba88] hover:shadow-xl hover:shadow-emerald-500/15 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center cursor-default">
                  <div className="relative mb-2">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-slate-100 shadow-xs group-hover:scale-105 group-hover:border-cyan-200 transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0284c7&color=fff&bold=true`;
                      }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[9px] shadow-xs">
                      {member.category === "hardware" || member.category === "iot" ? (
                        <Cpu className="w-2.5 h-2.5 text-emerald-400" />
                      ) : (
                        <Code2 className="w-2.5 h-2.5 text-cyan-400" />
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs leading-tight mb-0.5 truncate w-full" title={member.name}>
                    {member.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium mb-2 truncate w-full" title={member.role}>
                    {member.role}
                  </p>

                  <div className="mt-auto pt-1.5 w-full border-t border-slate-50 flex items-center justify-center">
                    <span
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${member.category === "hardware"
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
