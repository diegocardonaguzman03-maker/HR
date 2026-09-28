/**
 * Evaluación final del recorrido. Preguntas didácticas sobre el flujo de acería y colada continua.
 * Las cifras citadas son las del modelo simulado de esta app (ver docs/process-assumptions.md),
 * no límites de operación de una planta real.
 */
import type { SimState } from '../types/process';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  /** Índice de la opción correcta. */
  answer: number;
  explanation: string;
  /** Paso del proceso donde se ve el tema en 3D. */
  step: SimState;
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'hot-heel',
    question: '¿Qué se deja dentro del horno de una colada a la siguiente para proteger la solera y acelerar la fusión?',
    options: ['El pie líquido de acero y escoria', 'Una capa de polvo de molde', 'La barra falsa', 'Agua de enfriamiento'],
    answer: 0,
    explanation: 'El pie líquido recibe la chatarra de la siguiente carga, protege la solera del impacto y acelera la fusión.',
    step: 'CHARGING',
  },
  {
    id: 'foamy-slag',
    question: '¿Para qué sirve la escoria espumosa en el horno de arco eléctrico?',
    options: [
      'Para enfriar el acero antes del vaciado',
      'Para cubrir los arcos, proteger los paneles y aprovechar mejor la energía',
      'Para aumentar el azufre del acero',
      'Para lubricar el molde',
    ],
    answer: 1,
    explanation: 'El CO que se forma al inyectar carbón y oxígeno espuma la escoria; esta cubre los arcos, protege paneles y bóveda y mejora la transferencia de energía.',
    step: 'REFINING',
  },
  {
    id: 'phosphorus',
    question: 'Durante la afinación en el horno, ¿a dónde se va el fósforo?',
    options: ['Se evapora con los gases', 'Se queda en el acero', 'Pasa a la escoria básica y oxidante', 'Se elimina en el distribuidor'],
    answer: 2,
    explanation: 'La desfosforación necesita una escoria básica y oxidante. Por eso importa no arrastrar esa escoria a la olla: el fósforo podría regresar al acero.',
    step: 'REFINING',
  },
  {
    id: 'tapping',
    question: '¿Por qué el horno regresa a su posición antes de terminar de vaciar todo?',
    options: [
      'Para ahorrar tiempo de grúa',
      'Para evitar el arrastre de escoria a la olla y conservar el pie líquido',
      'Para medir la temperatura',
      'Para cambiar los electrodos',
    ],
    answer: 1,
    explanation: 'La escoria del horno es oxidante: en la olla consume aluminio, regresa fósforo y dificulta la desulfuración.',
    step: 'TAPPING',
  },
  {
    id: 'ladle-furnace',
    question: '¿Cuál es la función principal del horno olla?',
    options: [
      'Fundir la chatarra',
      'Cortar el planchón',
      'Ajustar la química y la temperatura final, desulfurar y controlar inclusiones',
      'Enfriar el acero hasta solidificarlo',
    ],
    answer: 2,
    explanation: 'El horno olla recalienta con arcos, agrega ferroaleaciones, desulfura bajo escoria básica, agita con argón y entrega el acero listo para la máquina de colada.',
    step: 'SECONDARY_METALLURGY',
  },
  {
    id: 'turret',
    question: '¿Qué permite la torreta de ollas en la máquina de colada?',
    options: [
      'Cambiar de olla sin detener la máquina (colada en secuencia)',
      'Recalentar el acero',
      'Enderezar la barra',
      'Pesar el planchón terminado',
    ],
    answer: 0,
    explanation: 'Mientras una olla cuela, la otra espera en el brazo opuesto. Al girar la torreta la secuencia continúa sin parar la máquina.',
    step: 'TURRET',
  },
  {
    id: 'tundish',
    question: '¿Qué hace el distribuidor entre la olla y el molde?',
    options: [
      'Funde las ferroaleaciones',
      'Amortigua y reparte el acero con flujo estable y deja flotar inclusiones',
      'Solidifica la costra',
      'Corta la barra',
    ],
    answer: 1,
    explanation: 'El distribuidor es un recipiente intermedio: mantiene nivel y temperatura, permite cambiar ollas y alimenta el molde de forma estable.',
    step: 'TUNDISH_FILL',
  },
  {
    id: 'mold',
    question: 'En el molde de cobre enfriado por agua, ¿qué se forma?',
    options: ['El planchón totalmente sólido', 'La costra sólida inicial alrededor de un núcleo líquido', 'La escoria espumosa', 'Las marcas de oxicorte'],
    answer: 1,
    explanation: 'En el molde solo se solidifica una costra delgada. A la salida debe ser lo bastante fuerte para contener el núcleo líquido.',
    step: 'SHELL_FORMATION',
  },
  {
    id: 'metallurgical-length',
    question: 'En este simulador (1.2 m/min y K = 22 mm/√min), ¿a qué distancia del menisco queda totalmente sólido el planchón?',
    options: ['A la salida del molde (0.8 m)', 'Cerca de 10 m', 'Cerca de 32.8 m, antes del oxicorte', 'Después del oxicorte, en la mesa de salida'],
    answer: 2,
    explanation: 'Con e = K·√t, la costra llega a la mitad del espesor (115 mm) en unos 27 min; a 1.2 m/min eso da ≈ 32.8 m, antes del oxicorte a 36 m.',
    step: 'FINAL_SOLIDIFICATION',
  },
  {
    id: 'water-metal',
    question: '¿Cuál es el peligro más grave si hay una fuga de agua sobre el acero líquido?',
    options: ['Que baje la productividad', 'Una explosión de vapor', 'Que suba el carbono', 'Que se manche el planchón'],
    answer: 1,
    explanation: 'El agua atrapada bajo metal fundido se convierte de golpe en vapor. Por eso las fugas en paneles, bóveda o lanzas se tratan como condición crítica.',
    step: 'MELTING',
  },
  {
    id: 'secondary-cooling',
    question: '¿Por qué el enfriamiento secundario no debe ser demasiado fuerte?',
    options: [
      'Porque gasta mucha agua',
      'Porque puede generar grietas en la superficie y en el interior',
      'Porque derrite los rodillos',
      'Porque detiene la oscilación del molde',
    ],
    answer: 1,
    explanation: 'Debe hacer crecer la costra, pero sin cambios bruscos de temperatura que generen esfuerzos y grietas.',
    step: 'SECONDARY_COOLING',
  },
  {
    id: 'traceability',
    question: '¿Qué liga a cada planchón con su historia de proceso?',
    options: ['Su color', 'El marcado con número de colada y de planchón (trazabilidad)', 'Su peso', 'La hora de corte'],
    answer: 1,
    explanation: 'El marcado permite relacionar el planchón con la química de su colada y sus condiciones de colado.',
    step: 'COMPLETE',
  },
];

export const QUIZ_PASS = 0.8;
