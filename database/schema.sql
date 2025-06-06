-- Create the 'students' table to store player data
-- This table holds the unique RFID card ID and the student's information.
CREATE TABLE IF NOT EXISTS `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rfid_uid` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `student_number` varchar(255) NOT NULL,
  `points` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `rfid_uid` (`rfid_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create the 'questions' table for the flashcard game
-- This holds the question text, multiple choice options, the correct answer, and the difficulty level.
CREATE TABLE IF NOT EXISTS `questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_text` text NOT NULL,
  `option_a` varchar(255) NOT NULL,
  `option_b` varchar(255) NOT NULL,
  `option_c` varchar(255) NOT NULL,
  `correct_answer` varchar(255) NOT NULL,
  `difficulty` enum('easy','medium','hard') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Clear any old questions before inserting new ones to prevent duplicates.
DELETE FROM questions;

-- Populate the 'questions' table with all 200 questions.
INSERT INTO `questions` (`question_text`, `option_a`, `option_b`, `option_c`, `correct_answer`, `difficulty`) VALUES
-- Easy Questions
('What is a primary characteristic of a microcontroller (MCU)?', 'It requires many external components to function', 'It has all essential components on a single chip', 'It is designed for general-purpose computing', 'It has all essential components on a single chip', 'easy'),
('What does ROM stand for?', 'Random Original Memory', 'Read-Only Memory', 'Run-On Memory', 'Read-Only Memory', 'easy'),
('Which of these is an example of an external communication interface?', 'SPI', 'I2C', 'USB', 'USB', 'easy'),
('What is a key feature of synchronous communication?', 'It does not require a clock', 'It uses start and stop bits for each character', 'It requires a shared, synchronized clock signal', 'It requires a shared, synchronized clock signal', 'easy'),
('Which component in an embedded system converts physical quantities like temperature into electrical signals?', 'Actuator', 'Sensor', 'DAC', 'Sensor', 'easy'),
('What does "COTS" stand for in the context of engineering?', 'Computer-On-The-Shelf', 'Commercial Off-The-Shelf', 'Custom-On-The-System', 'Commercial Off-The-Shelf', 'easy'),
('Is RAM (Random Access Memory) volatile or non-volatile?', 'Volatile (loses data when power is off)', 'Non-volatile (keeps data when power is off)', 'Both depending on the type', 'Volatile (loses data when power is off)', 'easy'),
('Which communication protocol is known for using just two wires, SDA and SCL?', 'UART', 'SPI', 'I2C', 'I2C', 'easy'),
('What is the term for a computer system designed to perform a specific function within a larger system?', 'General-Purpose Computer', 'Embedded System', 'Supercomputer', 'Embedded System', 'easy'),
('What does an Actuator do in an embedded system?', 'It senses the environment', 'It generates physical action or movement', 'It processes data', 'It generates physical action or movement', 'easy'),
('Which type of memory is used to store firmware and boot loaders and cannot be easily modified?', 'RAM', 'ROM', 'Cache', 'ROM', 'easy'),
('What is the main purpose of a boot loader in an embedded system?', 'To run user applications', 'To initialize the system and load the operating system', 'To store user data', 'To initialize the system and load the operating system', 'easy'),
('What does "non-volatile" memory mean?', 'It is very fast', 'It requires constant power to retain data', 'It retains data even when the power is turned off', 'It retains data even when the power is turned off', 'easy'),
('Which of these is a key characteristic of an embedded system?', 'High cost and large size', 'Designed for a single, specific task', 'Easily upgradable by the user', 'Designed for a single, specific task', 'easy'),
('What does MTBF stand for?', 'Mean Time Before Friday', 'Mean Time Between Failures', 'Maximum Time Before Failure', 'Mean Time Between Failures', 'easy'),
('Which of these is a common application of embedded systems?', 'Desktop Publishing', 'Video Editing Software', 'Automotive anti-lock braking systems', 'Automotive anti-lock braking systems', 'easy'),
('What type of communication uses a separate clock line to synchronize the sender and receiver?', 'Asynchronous', 'Synchronous', 'Parallel', 'Synchronous', 'easy'),
('What does a "bit" represent in digital computing?', 'A small piece of dust', 'A single binary digit (0 or 1)', 'A type of screw', 'A single binary digit (0 or 1)', 'easy'),
('Which component is considered the "brain" of a microcontroller?', 'Memory', 'CPU (Central Processing Unit)', 'I/O Port', 'CPU (Central Processing Unit)', 'easy'),
('What is the function of a Digital-to-Analog Converter (DAC)?', 'Convert sensor data to digital', 'Convert digital control signals to analog signals for actuators', 'Store digital data', 'Convert digital control signals to analog signals for actuators', 'easy'),
('In an embedded system block diagram, what typically provides the initial input?', 'Actuator', 'Sensor', 'Memory', 'Sensor', 'easy'),
('What is a common characteristic of a "Stand-Alone" embedded system?', 'It requires a constant network connection', 'It is self-sufficient and does not depend on a host system', 'It is always very large', 'It is self-sufficient and does not depend on a host system', 'easy'),
('What is the main advantage of "Low Power Consumption" in embedded systems?', 'It makes the device run faster', 'It is ideal for battery-powered and portable devices', 'It makes the device more expensive', 'It is ideal for battery-powered and portable devices', 'easy'),
('The term "firmware" in an embedded system usually refers to:', 'The outer casing of the device', 'Software programmed into non-volatile memory like ROM', 'The power supply unit', 'Software programmed into non-volatile memory like ROM', 'easy'),
('Which communication protocol uses four lines named MOSI, MISO, SCK, and SS?', 'I2C', 'UART', 'SPI', 'SPI', 'easy'),
('Which type of memory is known as "volatile" memory?', 'ROM', 'Flash', 'RAM', 'RAM', 'easy'),
('What is the primary function of the "Power Supply" in an embedded system?', 'To provide the necessary electrical power to all components', 'To process data', 'To store information', 'To provide the necessary electrical power to all components', 'easy'),
('What is a key difference between an ASIC and a COTS component?', 'ASICs are custom-designed for a specific task, while COTS are ready-made', 'COTS components are always faster than ASICs', 'ASICs are cheaper for single prototypes', 'ASICs are custom-designed for a specific task, while COTS are ready-made', 'easy'),
('The "Internet of Things" (IoT) primarily involves which type of embedded systems?', 'Stand-Alone', 'Networked', 'Mobile', 'Networked', 'easy'),
('Which of these is a primary quality attribute of an embedded system?', 'Reliability', 'Expandability', 'Color', 'Reliability', 'easy'),

-- Medium Questions
('Why is a microprocessor (MPU) preferred for a PC while an MCU is used for a washing machine?', 'MPUs are cheaper and smaller', 'MPUs are for general-purpose computing, while MCUs are for specific control tasks', 'MCUs are faster than MPUs', 'MPUs are for general-purpose computing, while MCUs are for specific control tasks', 'medium'),
('What is the main drawback of asynchronous transmission compared to synchronous transmission?', 'It is more expensive', 'It is more complex to implement', 'Its data transfer rate is slower due to start/stop bits', 'Its data transfer rate is slower due to start/stop bits', 'medium'),
('What is the primary function of an ADC in the flow of an embedded system?', 'To convert user commands into actions', 'To convert sensor signals into a format the microcontroller can process', 'To convert digital data into physical movement', 'To convert sensor signals into a format the microcontroller can process', 'medium'),
('What is a key difference between Flash Memory and EEPROM?', 'Flash is for user programs (sketches), while EEPROM is for storing system configuration data', 'EEPROM is faster than Flash memory', 'Flash memory is volatile, while EEPROM is not', 'Flash is for user programs (sketches), while EEPROM is for storing system configuration data', 'medium'),
('What is a key disadvantage of using SPI compared to I2C?', 'It is slower', 'It requires more complex wiring (more pins)', 'It does not support full-duplex communication', 'It requires more complex wiring (more pins)', 'medium'),
('An embedded system in a critical medical device like a pacemaker is best described as what type of system?', 'Soft Real-Time System', 'Hard Real-Time System', 'Stand-Alone System', 'Hard Real-Time System', 'medium'),
('What is the main purpose of "Memory Shadowing"?', 'To save power by turning off primary memory', 'To ensure system reliability by creating a backup copy of memory', 'To hide memory from unauthorized users', 'To ensure system reliability by creating a backup copy of memory', 'medium'),
('Which quality of an embedded system refers to its ability to handle faults gracefully?', 'Performance', 'Scalability', 'Reliability', 'Reliability', 'medium'),
('Why would an engineer choose a PLD (like an FPGA) over an ASIC for a new product prototype?', 'ASICs are more flexible', 'PLDs allow for reprogramming and testing before committing to a final ASIC design', 'ASICs have a lower initial development cost', 'PLDs allow for reprogramming and testing before committing to a final ASIC design', 'medium'),
('Which memory type is faster but also more expensive, making it suitable for cache?', 'DRAM', 'SRAM', 'Flash Memory', 'SRAM', 'medium'),
('What does it mean for an embedded system to be "task-specific"?', 'It can only perform one task at a time', 'It is designed and optimized for one particular function or set of functions', 'It requires a specific type of power source', 'It is designed and optimized for one particular function or set of functions', 'medium'),
('What is a major limitation of Mask ROM?', 'It is volatile', 'It can be programmed only once by the user', 'It cannot be changed or updated after manufacturing', 'It cannot be changed or updated after manufacturing', 'medium'),
('In what situation would you use an external communication interface like Ethernet instead of an onboard one like SPI?', 'When communicating between two chips on the same circuit board', 'When the device needs to connect to a local area network (LAN)', 'When low power consumption is the absolute top priority', 'When the device needs to connect to a local area network (LAN)', 'medium'),
('A digital camera is an example of which type of embedded system, based on its functionality?', 'Stand-Alone', 'Networked', 'Real-Time', 'Stand-Alone', 'medium'),
('Why do many embedded systems have minimal or no user interface (UI)?', 'To make them cheaper and more reliable for their specific task', 'Because users do not like interfaces', 'To make them harder to use', 'To make them cheaper and more reliable for their specific task', 'medium'),
('What is a key advantage of a COTS component?', 'It offers the highest possible performance', 'It has a longer development time', 'It is readily available and has a lower initial cost', 'It is readily available and has a lower initial cost', 'medium'),
('Which is NOT a primary factor when selecting memory for an embedded system?', 'Power Consumption', 'Brand Name', 'Cost', 'Brand Name', 'medium'),
('What is a key difference between SRAM and DRAM?', 'SRAM is non-volatile, while DRAM is volatile', 'SRAM is slower and cheaper than DRAM', 'SRAM is faster but requires more power and is more expensive than DRAM', 'SRAM is faster but requires more power and is more expensive than DRAM', 'medium'),
('Why is "maintainability" an important quality for an embedded system?', 'It ensures the system can be easily updated or repaired after deployment', 'It means the system maintains a constant temperature', 'It allows the user to change the system''s core function', 'It ensures the system can be easily updated or repaired after deployment', 'medium'),
('What is the main role of "peripherals" on a microcontroller?', 'To provide processing power', 'To handle input and output functions (like timers, communication, etc.)', 'To store the main application code', 'To handle input and output functions (like timers, communication, etc.)', 'medium'),
('What is the primary difference between a "Hard" and "Soft" real-time system?', 'Hard real-time has strict, unbreakable deadlines, while soft real-time can tolerate some delay', 'Hard real-time systems are physically tougher', 'Soft real-time systems are easier to program', 'Hard real-time has strict, unbreakable deadlines, while soft real-time can tolerate some delay', 'medium'),
('What does "full-duplex" communication, as seen in SPI, mean?', 'Data can only be sent one way', 'Data can only be received one way', 'Data can be sent and received at the same time', 'Data can be sent and received at the same time', 'medium'),
('In a PLC, what is "ladder logic"?', 'A type of hardware description language', 'A user-friendly, graphical programming language for industrial automation', 'A physical ladder used to access the controller', 'A user-friendly, graphical programming language for industrial automation', 'medium'),
('What is a significant disadvantage of wireless communication like Wi-Fi for some embedded systems?', 'It is vulnerable to security threats and interference', 'It requires physical cables', 'It has a very low data rate', 'It is vulnerable to security threats and interference', 'medium'),
('The process of converting a continuous analog signal to discrete digital values is called:', 'Modulation', 'Amplification', 'Quantization', 'Quantization', 'medium'),
('In the history of embedded systems, the "IoT" era is primarily characterized by:', 'The invention of the first microcontroller', 'The rise of 8-bit computing', 'The integration of connectivity and networking', 'The integration of connectivity and networking', 'medium'),
('Which of these is a major disadvantage of embedded systems?', 'High stability and reliability', 'Task-specific design', 'Limited flexibility and difficulty upgrading', 'Limited flexibility and difficulty upgrading', 'medium'),
('What is a "memory-mapped interface"?', 'A map showing where memory chips are on a PCB', 'A method of accessing hardware devices as if they were memory locations', 'A graphical interface for viewing memory contents', 'A method of accessing hardware devices as if they were memory locations', 'medium'),
('The ESP32 has a significant advantage over the Arduino Uno for IoT projects because it has:', 'More analog pins', 'A faster clock speed', 'Built-in Wi-Fi and Bluetooth', 'Built-in Wi-Fi and Bluetooth', 'medium'),
('What is the purpose of "start and stop bits" in asynchronous communication?', 'To provide error checking', 'To indicate the beginning and end of a character/byte', 'To synchronize the clocks of the sender and receiver', 'To indicate the beginning and end of a character/byte', 'medium'),

-- Hard Questions
('A system must control multiple actuators based on sensor inputs within a strict, non-negotiable timeframe to prevent failure. This system is best classified as:', 'A Networked, Soft Real-Time System', 'A Stand-Alone, Hard Real-Time System', 'A Mobile, Sophisticated System', 'A Stand-Alone, Hard Real-Time System', 'hard'),
('During asynchronous serial communication, a standard character frame is often 10 bits. What do these 10 bits typically comprise?', '10 data bits', '8 data bits, 1 start bit, and 1 stop bit', '7 data bits, 1 parity bit, 1 start bit, and 1 stop bit', '8 data bits, 1 start bit, and 1 stop bit', 'hard'),
('What does "quantization error" mean in A-to-D conversion?', 'Noise from the power supply affecting the signal', 'Errors from approximating a continuous analog signal to discrete digital levels', 'The time delay (latency) introduced by the conversion', 'Errors from approximating a continuous analog signal to discrete digital levels', 'hard'),
('While ASICs offer superior performance, what is their primary disadvantage regarding flexibility and cost?', 'They cannot be changed after manufacturing and have high upfront development costs', 'They consume more power than CPUs', 'They are difficult to find for high-volume production', 'They cannot be changed after manufacturing and have high upfront development costs', 'hard'),
('What is a key difference in the programming approach for a PLC versus a PLD?', 'PLCs use VHDL/Verilog, while PLDs use ladder logic', 'PLCs use user-friendly ladder logic, while PLDs are programmed with VHDL/Verilog', 'Both are programmed using the same languages', 'PLCs use user-friendly ladder logic, while PLDs are programmed with VHDL/Verilog', 'hard'),
('A developer needs to choose a communication interface for a high-speed, short-distance link between an MCU and an SD card on the same PCB. Which is the most appropriate choice?', 'UART, due to its simplicity', 'I2C, due to its low pin count', 'SPI, due to its high data rates and full-duplex nature', 'SPI, due to its high data rates and full-duplex nature', 'hard'),
('In the history of embedded systems, what key innovation enabled smaller, cheaper devices in the 1970s?', 'The invention of the transistor', 'The integration of CPU, memory, and I/O onto a single microcontroller chip', 'The development of AI algorithms', 'The integration of CPU, memory, and I/O onto a single microcontroller chip', 'hard'),
('Which memory is non-volatile but allows multi-byte erasure, making it standard for storing sketches on modern MCUs?', 'Mask ROM', 'EEPROM', 'Flash Memory', 'Flash Memory', 'hard'),
('An industrial control system uses a Single-Board Computer (SBC) to manage data processing. This SBC is an example of what?', 'An ASIC', 'A PLD', 'A COTS component', 'A COTS component', 'hard'),
('What is the fundamental reason RAM is "volatile"?', 'It has a limited number of write/erase cycles', 'It requires a continuous power supply to maintain the state of its memory cells', 'It is slower than non-volatile memory', 'It requires a continuous power supply to maintain the state of its memory cells', 'hard'),
('If a system requires immediate feedback, such as in a high-speed robotics application, which performance implication of signal conversion is most critical to minimize?', 'Quantization Error', 'Latency', 'Noise', 'Latency', 'hard'),
('A "Sophisticated Embedded System" often requires a configurable processor. Which technology is most representative of this?', 'An 8-bit microcontroller', 'An ASIC', 'A PLD (like an FPGA or CPLD)', 'A PLD (like an FPGA or CPLD)', 'hard'),
('What is the primary trade-off when choosing between a parallel memory interface and a serial memory interface?', 'Parallel is faster but requires more pins; Serial is slower but requires fewer pins', 'Parallel is cheaper but slower; Serial is more expensive but faster', 'Parallel is only for RAM; Serial is only for ROM', 'Parallel is faster but requires more pins; Serial is slower but requires fewer pins', 'hard'),
('Which statement accurately describes the relationship between PLCs and COTS in industrial automation?', 'PLCs are custom-designed ASICs, not COTS', 'PLCs are one of the most common types of COTS used in industrial automation', 'PLCs are a type of PLD and are not used with COTS', 'PLCs are one of the most common types of COTS used in industrial automation', 'hard'),
('A device that must guarantee safe operation under all conditions, such as in automotive or healthcare, prioritizes which quality?', 'Cost-Effectiveness', 'User Experience', 'Safety', 'Safety', 'hard'),
('A wearable health monitor that runs on a small battery would prioritize which two communication interface characteristics?', 'High data rate and long range', 'Low power consumption and simple pairing', 'Complex protocol and high security', 'Low power consumption and simple pairing', 'hard'),
('What is Direct Memory Access (DMA)?', 'A method for the CPU to access memory directly', 'A method for peripherals to access memory directly without CPU intervention', 'A type of non-volatile memory', 'A method for peripherals to access memory directly without CPU intervention', 'hard'),
('In the MCU vs MPU comparison, what does "Integration" refer to?', 'How well the chip integrates into a software environment', 'Having the CPU, memory, and peripherals on a single chip', 'The process of integrating multiple MPUs together', 'Having the CPU, memory, and peripherals on a single chip', 'hard'),
('What kind of data transmission is most suitable for streaming video or live chat rooms?', 'Asynchronous', 'Synchronous', 'Half-duplex', 'Synchronous', 'hard'),
('What is the primary reason for the "Limited Hardware" disadvantage in embedded systems?', 'Manufacturers intentionally limit the hardware', 'They are designed and optimized for specific tasks, so extra hardware is unnecessary', 'It is impossible to add more hardware to them', 'They are designed and optimized for specific tasks, so extra hardware is unnecessary', 'hard');