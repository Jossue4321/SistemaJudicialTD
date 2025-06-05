-- Insertar datos de ejemplo para el sistema judicial accesible

-- Insertar preguntas legales frecuentes
INSERT INTO public.legal_questions (question, answer, category, frequency)
VALUES
  ('¿Qué derechos tengo como persona con discapacidad motriz en el ámbito laboral?', 'Como persona con discapacidad motriz, tienes derecho a adaptaciones razonables en tu puesto de trabajo, protección contra la discriminación, y beneficios especiales como la estabilidad laboral reforzada. Los empleadores deben realizar ajustes que no representen una carga desproporcionada.', 'laboral', 120),
  ('¿Cómo puedo solicitar una pensión por discapacidad?', 'Para solicitar una pensión por discapacidad, necesitas obtener un certificado médico que acredite tu condición, realizar una evaluación de pérdida de capacidad laboral (debe ser igual o superior al 50%), y presentar la solicitud ante tu fondo de pensiones con la documentación completa.', 'pensiones', 150),
  ('¿Qué es la legítima ampliada y cómo me beneficia?', 'La legítima ampliada es una protección patrimonial especial para personas con discapacidad en materia de herencias. Te beneficia aumentando la porción de la herencia que te corresponde por ley, garantizando recursos suficientes para tu manutención y cuidados especiales.', 'herencias', 80),
  ('¿Qué puedo hacer si un edificio público no tiene accesibilidad?', 'Si un edificio público no cuenta con accesibilidad, puedes presentar una queja formal ante la entidad responsable, interponer una acción de tutela por vulneración de derechos fundamentales, o denunciar ante la Procuraduría. La ley exige que todos los espacios públicos sean accesibles.', 'accesibilidad', 110),
  ('¿Tengo derecho a un intérprete de lengua de señas en procesos judiciales?', 'Sí, tienes derecho a un intérprete de lengua de señas en cualquier proceso judicial. Este es un derecho fundamental que garantiza el acceso a la justicia en igualdad de condiciones. El Estado debe proporcionarlo de manera gratuita.', 'judicial', 70),
  ('¿Qué beneficios tributarios existen para personas con discapacidad?', 'Las personas con discapacidad pueden acceder a beneficios tributarios como exenciones en el impuesto de renta, reducción en el impuesto vehicular, y beneficios en la importación de ayudas técnicas y tecnológicas. Estos varían según la legislación local.', 'tributario', 95),
  ('¿Cómo puedo certificar oficialmente mi discapacidad?', 'Para certificar tu discapacidad, debes solicitar una valoración por un equipo multidisciplinario autorizado, presentar tu historia clínica y exámenes complementarios, y seguir el procedimiento establecido por el Ministerio de Salud para obtener el certificado oficial.', 'certificación', 200),
  ('¿Qué ayudas económicas puedo solicitar como persona con discapacidad?', 'Puedes solicitar subsidios para adaptaciones en vivienda, ayudas técnicas y tecnológicas, programas de emprendimiento inclusivo, y beneficios en servicios públicos. Cada programa tiene requisitos específicos que debes cumplir.', 'ayudas', 130),
  ('¿Qué derechos tengo en materia de transporte público?', 'Tienes derecho a transporte público accesible, tarifas preferenciales, asientos prioritarios, y asistencia para el abordaje y descenso. Las empresas de transporte deben garantizar estas condiciones según la normativa de accesibilidad.', 'transporte', 85),
  ('¿Cómo puedo proteger legalmente el patrimonio de mi hijo con discapacidad?', 'Puedes proteger el patrimonio de tu hijo mediante un fideicomiso, patrimonio de afectación, testamento con cláusulas especiales, o designación de apoyos legales. Es recomendable consultar con un abogado especializado para elegir la mejor opción.', 'patrimonio', 75);

-- Insertar abogados
INSERT INTO public.lawyers (full_name, specialty, experience_years, rating, available, avatar_url)
VALUES
  ('Dra. María González', 'Derechos de Discapacidad', 15, 4.9, true, '/images/lawyers/maria-gonzalez.jpg'),
  ('Dr. Carlos Rodríguez', 'Derecho Laboral y Discapacidad', 12, 4.8, true, '/images/lawyers/carlos-rodriguez.jpg'),
  ('Dra. Ana Martínez', 'Derecho Civil y Herencias', 18, 4.9, true, '/images/lawyers/ana-martinez.jpg'),
  ('Dr. Javier López', 'Pensiones y Seguridad Social', 10, 4.7, true, '/images/lawyers/javier-lopez.jpg'),
  ('Dra. Laura Sánchez', 'Accesibilidad y Derechos Humanos', 14, 4.8, true, '/images/lawyers/laura-sanchez.jpg'),
  ('Dr. Miguel Torres', 'Derecho Administrativo', 16, 4.6, false, '/images/lawyers/miguel-torres.jpg'),
  ('Dra. Patricia Vargas', 'Derecho de Familia', 13, 4.7, true, '/images/lawyers/patricia-vargas.jpg'),
  ('Dr. Roberto Mendoza', 'Derecho Constitucional', 20, 4.9, false, '/images/lawyers/roberto-mendoza.jpg');
