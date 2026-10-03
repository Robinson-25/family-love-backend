// ─── EQUIPO DIRECTIVO INICIAL ────────────────────────────────────────────────
// Estas son las personas que ya estaban en la página. Se guardan en la base de
// datos SOLO la primera vez (cuando la tabla "equipo" está vacía). Después,
// todo se administra desde el panel: Equipo Directivo.
export const EQUIPO_INICIAL: { nombre: string; cargo: string; imagen: string; bio: string }[] = [
  {
    nombre: "Tania Trinidad",
    cargo: "DIRECTORA GENERAL - FUNDADORA",
    imagen: "/images/quienes-somos/equipo/tania.png",
    bio: "Estudiante de Medicina Humana. Modelo profesional, 2021–actualidad. Fundadora de la organización Family Love y de 'Alza Tu Voz'. Becaria del Aspire Leaders Program (fundado por Harvard) y del programa Patria C. Parlamentaria Joven - Plenario Región Junín, 2025. Embajadora IRF, 2026. Community Leader Institute Aspire, 2026. Co-directora general de Family Love, 2024, y directora general durante el periodo 2025–2026. Ponente de la conferencia 'Liderar desde lo humano: jóvenes que transforman realidades desde la empatía y la acción' – Bridges of Equity.",
  },
  {
    nombre: "Darlyne Oviedo",
    cargo: "SECRETARÍA GENERAL",
    imagen: "/images/quienes-somos/equipo/darlyne.jpg",
    bio: "Estudiante de la carrera de Derecho en la Universidad Continental. Participante del Impact Startup Competition UP, 2021. Ponente en el Seminario Internacional Interdisciplinario sobre Desenvolvimiento y Sociedad – UNIARP, 2025. Secretaria General de la organización Family Love, 2024–actualidad. Becaria del programa Beca 18 – Convocatoria 2021.",
  },
  {
    nombre: "María A. Campos",
    cargo: "DIRECTORA DE RELACIONES INTERNACIONALES",
    imagen: "/images/quienes-somos/equipo/maria.png",
    bio: "Estudiante de Maestría en Relaciones Internacionales en la Universidad Federal de la Integración Latinoamericana (UNILA) – becaria CNPq. Licenciada en Ciencia Política y Sociología por la UNILA. Investigadora del Programa de Educación por el Trabajo (PET), con reconocimiento de honor. Voluntaria en organizaciones de apoyo a población migrante y derechos humanos en Brasil y Colombia. Participante del Kectil Program e integrante del Aspire Leaders Program 2026 (fundado por Harvard). Ganadora del primer lugar en el Concurso de Ensayos de la Jornada Internacional de Diplomacia y Participación Juvenil, 2026. Autora de publicaciones académicas sobre maternidad, salud mental y políticas públicas en el SUS. Dominio de español y portugués, con inglés en formación.",
  },
  {
    nombre: "Jhan Toro",
    cargo: "DIRECTOR ACADÉMICO",
    imagen: "/images/quienes-somos/equipo/jhan-toro.png",
    bio: "Estudiante de la Facultad de Medicina Humana de la Universidad Nacional del Centro del Perú (UNCP). Participante en campañas médicas en Tarma, brindando apoyo asistencial y sesiones educativas sobre estilos de vida saludable. Subdirector Académico de Family Love, 2025. Tutor de la Academia Intelectus y docente en academias preuniversitarias en cursos como Biología, Anatomía y Razonamiento Matemático, entre otros. Formación en oratoria, liderazgo y cursos especializados de la carrera de Medicina Humana.",
  },
  {
    nombre: "Ibeth Fernandez",
    cargo: "SUB DIRECTORA ACADÉMICA",
    imagen: "/images/quienes-somos/equipo/ibeth.png",
    bio: "Estudiante de la Facultad de Medicina Humana. Participante en campañas médicas en Comas. Voluntaria en la campaña navideña de San José de Apata – Family Love, 2025, y en la campaña navideña de Ullusca, Jauja – Family Love, 2024. Subdirectora del Comité Académico durante el periodo 2025–2026. Formación en Ofimática en el Centro Educativo Procedat.",
  },
  {
    nombre: "Sheyla Aliaga",
    cargo: "COORDINADORA ACADÉMICA DE DERECHO",
    imagen: "/images/quienes-somos/equipo/sheyla.png",
    bio: "Bachiller en Derecho y Ciencias Políticas por la Universidad de Huánuco. Becaria del programa Ashanti Perú; representante en el Encuentro Nacional de la Juventud 2024; seleccionada para el Laboratorio Macrocentro de Actúa.pe y el programa Patria C. Voluntaria del Ministerio Público, promotora ambiental de EDUCCA y voluntaria de la Dirección Regional de Trabajo de Huánuco. Directora de Justicia y Derechos Humanos y Subdirectora de Medio Ambiente. Ponente y facilitadora en charlas de Escuela de Padres, talleres de Educación Sexual Integral (ESI) y capacitaciones sobre prevención de la trata de personas. Formación en liderazgo y oratoria.",
  },
  {
    nombre: "Nayruth Paucar",
    cargo: "COORDINADORA ACADÉMICA DE INGENIERÍA Y TECNOLOGÍA",
    imagen: "/images/quienes-somos/equipo/nayruth.png",
    bio: "Egresada de la carrera de Ingeniería Agrónoma de la Universidad Nacional del Santa (UNS). Exalumna del programa Aspire Leaders. Excoordinadora del programa 'PROYÉCTATE' de la Región de Ancash. Directora de Desarrollo e Inclusión Social de la REDMUN Ancash. Voluntaria en Chimbote de Pie, enfocada en la defensa del medio ambiente y la descontaminación de la bahía El Ferrol. Voluntaria en proyectos sociales de iniciativas educativas y del programa 'VOCACIÓNATE'.",
  },
  {
    nombre: "Cristhel Gonzales",
    cargo: "CO-COORDINADORA ESCOLAR",
    imagen: "/images/quienes-somos/equipo/cristhel.png",
    bio: "Estudiante de Trabajo Social en la Universidad Nacional del Centro del Perú (UNCP). Participante en el foro 'Mujeres Empoderadas'. Voluntaria en EsSalud y en la Fundación Peruana de Cáncer. Integrante de la Red Internacional de Jóvenes Empoderadas del Perú.",
  },
  {
    nombre: "Brayhan Lazo",
    cargo: "CO-COORDINADOR ESCOLAR",
    imagen: "/images/quienes-somos/equipo/brayhan.png",
    bio: "Estudiante de Ingeniería Metalúrgica y de Materiales en la Universidad Nacional del Centro del Perú (UNCP). Interés en la aplicación de herramientas digitales y métodos matemáticos avanzados para la resolución de problemas de ingeniería. Emprendedor activo, comprometido con el desarrollo profesional y el aprendizaje continuo.",
  },
  {
    nombre: "Marely Rodriguez",
    cargo: "DIRECTORA DE ACCIÓN COMUNITARIA",
    imagen: "/images/quienes-somos/equipo/marely.png",
    bio: "Egresada de la carrera de Sociología de la Universidad Nacional del Centro del Perú (UNCP). Participante en foros de gestión pública orientados al desarrollo social y juvenil. Becaria y voluntaria del programa Jóvenes Emprendedores EduCaixa. Exdirectora de Desarrollo e Inclusión Social de la Red MUN Junín. Voluntaria en veeduría y vigilancia de programas sociales del MIDIS. Voluntaria en proyectos sociales enfocados en iniciativas educativas y de desarrollo social.",
  },
  {
    nombre: "Evans Malpartida",
    cargo: "SUB DIRECTOR DE ACCIÓN COMUNITARIA",
    imagen: "/images/quienes-somos/equipo/evans.png",
    bio: "Estudiante de Ingeniería Civil en la Universidad Peruana Los Andes (UPLA). Participante de Parlamento Joven y de programas de formación política y liderazgo juvenil. Promotor de iniciativas orientadas a la participación ciudadana, el liderazgo juvenil y el cumplimiento de los Objetivos de Desarrollo Sostenible (ODS). Participación activa en voluntariados y actividades de impacto social en la región Junín. Comprometido con generar impacto positivo mediante el trabajo colaborativo y la participación juvenil.",
  },
  {
    nombre: "Abigail Crispin",
    cargo: "COORDINADORA DE VOLUNTARIADO",
    imagen: "/images/quienes-somos/equipo/abigail.png",
    bio: "Estudiante de Medicina Humana en la Universidad Peruana Los Andes (UPLA). Participante de Clown Hospitalario – UPLA. Voluntaria en la campaña navideña de San José de Apata – Family Love, 2025.",
  },
  {
    nombre: "Mafer Mayta",
    cargo: "DIRECTORA DE SALUD Y BIENESTAR",
    imagen: "/images/quienes-somos/equipo/mafer.png",
    bio: "Estudiante de la Facultad de Medicina Humana. Pasante de la Pasantía Nacional Médica en Oncología 'MAQANA ONCO' – Lucha Oncológica, 2026, en el IREN Centro – Concepción. Coordinadora Nacional de Trivias Académicas del Comité Permanente Académico de la Sociedad Científica Médico Estudiantil Peruana (CPA SOCIMEP), 2025. Directora Nacional del Comité Permanente de Relaciones Interinstitucionales e Intercambios de la Sociedad Científica Médico Estudiantil Peruana (CPRII SOCIMEP), 2024. Voluntaria universitaria en el Centro del Adulto Mayor de EsSalud (CAM EsSalud), Concepción, durante los años 2022 y 2023.",
  },
  {
    nombre: "Xiomara Villena",
    cargo: "SUB DIRECTORA DE SALUD Y BIENESTAR",
    imagen: "/images/quienes-somos/equipo/xiomara.png",
    bio: "Estudiante de la Facultad de Medicina Humana. Organizadora de eventos de pequeña escala. Con vocación de aprendizaje y compromiso con la ayuda a quienes más lo necesitan.",
  },
  {
    nombre: "Esaú Sedano",
    cargo: "DIRECTOR DE COMUNICACIONES Y RR. SS.",
    imagen: "/images/quienes-somos/equipo/esau.png",
    bio: "Administrador de Empresas por la Universidad Nacional del Centro del Perú (UNCP). Estudiante de la carrera de Diseño Gráfico en el Instituto Continental. Director de Comunicaciones, Redes Sociales y fotógrafo de Family Love, 2026. Director de Diseño Gráfico y fotógrafo de Family Love, 2025. Apasionado por la fotografía, la música y el deporte. Comprometido con la ayuda social, manteniendo una actitud positiva y promoviendo alegría en quienes más lo necesitan.",
  },
  {
    nombre: "Robinson W. Biktu",
    cargo: "SUBDIRECTOR DE DISEÑO Y DESARROLLO DIGITAL",
    imagen: "/images/quienes-somos/equipo/robinson.png",
    bio: "Estudiante de la carrera de Diseño y Desarrollo de Software en Tecsup. Subdirector de Diseño y Desarrollo Digital de la organización Family Love, 2026. Becario del programa Patria C, 2025. Egresado de estudios en Teología, con vocación de servicio, liderazgo y compromiso con el desarrollo de la comunidad. Apasionado por la tecnología, el diseño digital y el trabajo en equipo, buscando siempre aportar ideas creativas e innovadoras.",
  },
];
