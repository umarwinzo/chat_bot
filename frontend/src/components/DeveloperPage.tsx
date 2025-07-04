import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Code, 
  Github, 
  Mail, 
  ExternalLink, 
  Star, 
  Heart, 
  Zap, 
  Shield, 
  Globe, 
  Database, 
  Server, 
  Cpu, 
  Monitor, 
  Users,
  MessageSquare,
  Bot,
  Sparkles,
  Award,
  Trophy,
  Target,
  Rocket,
  Coffee,
  BookOpen,
  Download,
  Eye,
  GitBranch,
  Package,
  Terminal,
  Layers,
  Smartphone,
  Palette,
  Briefcase,
  Calendar,
  MapPin,
  Clock,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

export default function DeveloperPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [stats, setStats] = useState({
    commits: 1247,
    projects: 52,
    users: 10500,
    satisfaction: 99.2,
    downloads: 25600,
    stars: 892
  });

  const [currentSkill, setCurrentSkill] = useState(0);
  const [currentProject, setCurrentProject] = useState(0);

  const skills = [
    { name: 'Node.js', level: 95, color: 'green', icon: Server },
    { name: 'React', level: 92, color: 'blue', icon: Code },
    { name: 'TypeScript', level: 88, color: 'blue', icon: Code },
    { name: 'Express.js', level: 94, color: 'gray', icon: Database },
    { name: 'Socket.IO', level: 90, color: 'purple', icon: Zap },
    { name: 'Baileys', level: 96, color: 'green', icon: Bot },
    { name: 'MongoDB', level: 85, color: 'green', icon: Database },
    { name: 'PostgreSQL', level: 82, color: 'blue', icon: Database }
  ];

  const projects = [
    {
      name: 'WhatsApp Bot Platform',
      description: 'Advanced multi-user WhatsApp automation platform with enterprise features',
      tech: ['Node.js', 'React', 'Baileys', 'Socket.IO'],
      status: 'Active',
      users: '10K+',
      rating: 4.9
    },
    {
      name: 'AI Chat Assistant',
      description: 'Intelligent chatbot with natural language processing capabilities',
      tech: ['Python', 'TensorFlow', 'FastAPI', 'Redis'],
      status: 'Completed',
      users: '5K+',
      rating: 4.8
    },
    {
      name: 'Real-time Analytics Dashboard',
      description: 'Comprehensive analytics platform with live data visualization',
      tech: ['Vue.js', 'D3.js', 'WebSocket', 'InfluxDB'],
      status: 'Active',
      users: '3K+',
      rating: 4.7
    }
  ];

  const achievements = [
    { icon: Trophy, title: 'Top Developer 2024', description: 'Recognized for outstanding contributions' },
    { icon: Star, title: '1000+ GitHub Stars', description: 'Across all repositories' },
    { icon: Users, title: '10K+ Users Served', description: 'Active user base across projects' },
    { icon: Award, title: 'Innovation Award', description: 'For WhatsApp automation platform' }
  ];

  const timeline = [
    { year: '2024', title: 'WhatsApp Bot Platform v3.0', description: 'Launched advanced multi-user platform' },
    { year: '2023', title: 'Full Stack Mastery', description: 'Achieved expertise in modern web technologies' },
    { year: '2022', title: 'Open Source Contributor', description: 'Started contributing to major projects' },
    { year: '2021', title: 'Professional Developer', description: 'Began professional software development' }
  ];

  useEffect(() => {
    const skillInterval = setInterval(() => {
      setCurrentSkill((prev) => (prev + 1) % skills.length);
    }, 3000);

    const projectInterval = setInterval(() => {
      setCurrentProject((prev) => (prev + 1) % projects.length);
    }, 4000);

    return () => {
      clearInterval(skillInterval);
      clearInterval(projectInterval);
    };
  }, []);

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'contact', label: 'Contact', icon: Mail }
  ];

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-4"
      >
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <section.icon className="w-5 h-5" />
              <span className="font-medium">{section.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeSection === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Hero Section */}
            <div className="glass-effect rounded-3xl p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/30 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/30 to-transparent rounded-full translate-y-32 -translate-x-32"></div>
              
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-40 h-40 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 relative"
                >
                  <User className="w-20 h-20 text-white" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 animate-pulse opacity-50"></div>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent"
                >
                  DarkWinzo
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-2xl text-white/80 mb-6"
                >
                  Full Stack Developer & Bot Creator
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center justify-center space-x-2 mb-8"
                >
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-white/70 text-lg">5.0 Rating</span>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="text-xl text-white/80 leading-relaxed max-w-4xl mx-auto mb-8"
                >
                  Passionate developer specializing in WhatsApp automation, web development, and AI integration. 
                  Creating innovative solutions that bridge the gap between technology and user experience with 
                  a focus on scalability, security, and performance.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex flex-wrap items-center justify-center gap-4"
                >
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="mailto:isurulakshan9998@gmail.com"
                    className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-xl"
                  >
                    <Mail className="w-5 h-5" />
                    <span>Get In Touch</span>
                  </motion.a>
                  
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="https://github.com/DarkWinzo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-2xl font-semibold hover:from-gray-800 hover:to-black transition-all shadow-xl"
                  >
                    <Github className="w-5 h-5" />
                    <span>GitHub</span>
                  </motion.a>
                  
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="https://darkwinzo.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-xl"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Portfolio</span>
                  </motion.a>
                </motion.div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { icon: Code, value: stats.commits, label: 'Commits', color: 'blue', suffix: '' },
                { icon: Briefcase, value: stats.projects, label: 'Projects', color: 'green', suffix: '+' },
                { icon: Users, value: stats.users, label: 'Users', color: 'purple', suffix: '+' },
                { icon: Heart, value: stats.satisfaction, label: 'Satisfaction', color: 'red', suffix: '%' },
                { icon: Download, value: stats.downloads, label: 'Downloads', color: 'yellow', suffix: '+' },
                { icon: Star, value: stats.stars, label: 'Stars', color: 'orange', suffix: '+' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-effect rounded-2xl p-6 text-center"
                >
                  <stat.icon className={`w-8 h-8 text-${stat.color}-400 mx-auto mb-3`} />
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.value.toLocaleString()}{stat.suffix}
                  </div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Timeline */}
            <div className="glass-effect rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">Journey Timeline</h3>
              <div className="space-y-6">
                {timeline.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-start space-x-6"
                  >
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{item.year}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-white mb-2">{item.title}</h4>
                      <p className="text-white/70">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'skills' && (
          <motion.div
            key="skills"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Featured Skill */}
            <div className="glass-effect rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">Technical Expertise</h2>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSkill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center mb-8"
                >
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    {React.createElement(skills[currentSkill].icon, { className: "w-16 h-16 text-white" })}
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">{skills[currentSkill].name}</h3>
                  <div className="w-full max-w-md mx-auto bg-white/20 rounded-full h-4 mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skills[currentSkill].level}%` }}
                      className={`h-4 rounded-full bg-gradient-to-r from-${skills[currentSkill].color}-500 to-${skills[currentSkill].color}-600`}
                    ></motion.div>
                  </div>
                  <span className="text-2xl font-bold text-white">{skills[currentSkill].level}%</span>
                </motion.div>
              </AnimatePresence>

              {/* Skill Indicators */}
              <div className="flex justify-center space-x-2">
                {skills.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSkill(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSkill ? 'bg-blue-500 w-8' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* All Skills Grid */}
            <div className="glass-effect rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">All Technologies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <skill.icon className={`w-6 h-6 text-${skill.color}-400`} />
                        <span className="text-white font-medium">{skill.name}</span>
                      </div>
                      <span className="text-white/70">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-2 rounded-full bg-gradient-to-r from-${skill.color}-500 to-${skill.color}-600`}
                      ></motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Technology Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Frontend',
                  icon: Monitor,
                  color: 'blue',
                  techs: ['React', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion']
                },
                {
                  title: 'Backend',
                  icon: Server,
                  color: 'green',
                  techs: ['Node.js', 'Express.js', 'Socket.IO', 'MongoDB', 'PostgreSQL']
                },
                {
                  title: 'Tools & Others',
                  icon: Package,
                  color: 'purple',
                  techs: ['Git', 'Docker', 'AWS', 'Baileys', 'Redis']
                }
              ].map((category, index) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="glass-effect rounded-2xl p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <category.icon className={`w-8 h-8 text-${category.color}-400`} />
                    <h3 className="text-xl font-bold text-white">{category.title}</h3>
                  </div>
                  <div className="space-y-2">
                    {category.techs.map((tech, techIndex) => (
                      <div key={tech} className="flex items-center space-x-2">
                        <div className={`w-2 h-2 bg-${category.color}-400 rounded-full`}></div>
                        <span className="text-white/80">{tech}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeSection === 'projects' && (
          <motion.div
            key="projects"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Featured Project */}
            <div className="glass-effect rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">Featured Projects</h2>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentProject}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-8 border border-white/20"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{projects[currentProject].name}</h3>
                      <p className="text-white/80 text-lg">{projects[currentProject].description}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                      projects[currentProject].status === 'Active' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {projects[currentProject].status}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {projects[currentProject].tech.map((tech) => (
                      <span key={tech} className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{projects[currentProject].users}</div>
                      <div className="text-white/70">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="text-3xl font-bold text-white">{projects[currentProject].rating}</span>
                      </div>
                      <div className="text-white/70">User Rating</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Project Indicators */}
              <div className="flex justify-center space-x-2 mt-6">
                {projects.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentProject(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentProject ? 'bg-purple-500 w-8' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* All Projects */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-effect rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => setCurrentProject(index)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{project.name}</h3>
                    <div className={`w-3 h-3 rounded-full ${
                      project.status === 'Active' ? 'bg-green-400' : 'bg-blue-400'
                    }`}></div>
                  </div>
                  <p className="text-white/70 text-sm mb-4">{project.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">{project.users} users</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white text-sm">{project.rating}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Project Stats */}
            <div className="glass-effect rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 text-center">Project Impact</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { icon: Users, value: '18K+', label: 'Total Users', color: 'blue' },
                  { icon: Download, value: '25K+', label: 'Downloads', color: 'green' },
                  { icon: Star, value: '4.8', label: 'Avg Rating', color: 'yellow' },
                  { icon: GitBranch, value: '150+', label: 'Commits', color: 'purple' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <stat.icon className={`w-12 h-12 text-${stat.color}-400 mx-auto mb-3`} />
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-white/70">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="glass-effect rounded-2xl p-8 text-center"
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <achievement.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{achievement.title}</h3>
                  <p className="text-white/70">{achievement.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Recognition */}
            <div className="glass-effect rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">Recognition & Impact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Growth Impact</h4>
                  <p className="text-white/70">Helped businesses automate and scale their WhatsApp operations</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Security Focus</h4>
                  <p className="text-white/70">Implemented enterprise-grade security in all projects</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Innovation</h4>
                  <p className="text-white/70">Pioneered new approaches to WhatsApp automation</p>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="glass-effect rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">What People Say</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    text: "DarkWinzo's WhatsApp bot platform revolutionized our customer service. The multi-user support and security features are outstanding.",
                    author: "Sarah Johnson",
                    role: "CTO, TechCorp"
                  },
                  {
                    text: "Incredible attention to detail and performance. The platform handles thousands of messages daily without any issues.",
                    author: "Michael Chen",
                    role: "Lead Developer, StartupXYZ"
                  }
                ].map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.3 }}
                    className="bg-white/5 rounded-xl p-6"
                  >
                    <p className="text-white/80 italic mb-4">"{testimonial.text}"</p>
                    <div>
                      <div className="text-white font-semibold">{testimonial.author}</div>
                      <div className="text-white/60 text-sm">{testimonial.role}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'contact' && (
          <motion.div
            key="contact"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Contact Hero */}
            <div className="glass-effect rounded-2xl p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Mail className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-4">Let's Work Together</h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Ready to bring your ideas to life? I'm always excited to work on innovative projects 
                and help businesses leverage the power of automation.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="mailto:isurulakshan9998@gmail.com"
                  className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-xl"
                >
                  <Mail className="w-5 h-5" />
                  <span>Send Email</span>
                </motion.a>
                
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://github.com/DarkWinzo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-2xl font-semibold hover:from-gray-800 hover:to-black transition-all shadow-xl"
                >
                  <Github className="w-5 h-5" />
                  <span>GitHub</span>
                </motion.a>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-effect rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Get In Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-6 h-6 text-blue-400" />
                    <div>
                      <div className="text-white font-medium">Email</div>
                      <div className="text-white/70">isurulakshan9998@gmail.com</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-6 h-6 text-green-400" />
                    <div>
                      <div className="text-white font-medium">Location</div>
                      <div className="text-white/70">Sri Lanka</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-6 h-6 text-purple-400" />
                    <div>
                      <div className="text-white font-medium">Timezone</div>
                      <div className="text-white/70">UTC+5:30 (IST)</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Services</h3>
                <div className="space-y-3">
                  {[
                    'WhatsApp Bot Development',
                    'Full Stack Web Development',
                    'API Integration & Development',
                    'Database Design & Optimization',
                    'Real-time Applications',
                    'Technical Consulting'
                  ].map((service, index) => (
                    <div key={service} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-white/80">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="glass-effect rounded-2xl p-8 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-semibold">Available for new projects</span>
              </div>
              <p className="text-white/70">
                Currently accepting new projects and collaborations. 
                Response time: Usually within 24 hours.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}