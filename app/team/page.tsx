import FloatingSymbols from "@/components/floating-symbols"
import { Github, Linkedin, Twitter } from "lucide-react"

const teamMembers = [
  {
    name: "Priya Saxena",
    role: "Smart Contracts Developer",
    bio: "Specializes in smart contracts and Li-Fi API integration, ensuring secure, efficient cross-chain transactions with optimized liquidity and minimal slippage.",
    image: "/images/priya.jpg",
    linkedin: "https://www.linkedin.com/in/priya-saxena-a39638297 ",
    github: "https://github.com/Priya00300",
    twitter: "https://twitter.com/priyasaxena",
  },
  {
    name: "Shyam Jaiswal",
    role: "Smart Contracts Developer",
    bio: "Focuses on smart contracts and Li-Fi API integration, enhancing cross-chain swaps with secure, efficient, and cost-effective transactions.",
    image: "/images/shyam.jpg",
    linkedin: "https://www.linkedin.com/in/jaiswalism?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    github: "https://github.com/jaiswalism",
    twitter: "https://x.com/NovaLynx7?t=wPs1cfbYwA-BOYa5WKGR6w&s=09",
  },
  {
    name: "Priyanshi Singh",
    role: "Backend Developer",
    bio: "Focuses on building and optimizing the backend to handle real-time transactions, security protocols, making xBridge a robust and scalable platform.",
    image: "/images/priyanshi.jpg",
    linkedin: "https://www.linkedin.com/in/priyanshi-singh-230241287/",
    github: "https://github.com/",
    twitter: "https://twitter.com/priyanshisingh",
  },
  {
    name: "Vaishnavi Mishra",
    role: "Frontend Developer",
    bio: "Focuses on user experience and interface design, ensuring xBridge is accessible to both novice and experienced users.",
    image: "/images/vaishnavi.jpg",
    linkedin: "https://www.linkedin.com/in/vaishnavi-mishra-386935296/",
    github: "https://github.com/gensine",
    twitter: "https://x.com/0xVaishnavii",
  },
]

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#09122C] to-black relative overflow-hidden pt-20">
      <FloatingSymbols />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-[#BE3144] mb-10 text-center">Meet Our Team</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex flex-col items-center text-white"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-[#BE3144]/20">
                <img
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-bold mb-1">{member.name}</h2>
              <p className="text-[#BE3144] mb-3">{member.role}</p>
              <p className="text-sm text-center mb-4">{member.bio}</p>
              <div className="flex space-x-3 mt-auto">
                {member.twitter && (
                  <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white">
                    <Twitter size={18} />
                  </a>
                )}
                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white">
                    <Linkedin size={18} />
                  </a>
                )}
                {member.github && (
                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white">
                    <Github size={18} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}  