import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateProject } from "@/lib/mockAI";
import { cn, copyToClipboard, downloadText } from "@/lib/utils";
import type { ProjectDocument, ProjectFile } from "@/types";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Code2,
  Copy,
  Download,
  FileText,
  Link2,
  Presentation,
  Search,
  Shapes,
  Share2,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Data ────────────────────────────────────────────────────────────────────

interface Department {
  id: string;
  label: string;
  fullName: string;
  icon: string;
  gradient: string;
  glow: string;
  border: string;
}

const DEPARTMENTS: Department[] = [
  {
    id: "CSE",
    label: "CSE",
    fullName: "Computer Science & Engineering",
    icon: "💻",
    gradient: "from-blue-500/20 to-cyan-500/20",
    glow: "shadow-glow-blue",
    border: "border-blue-500/40",
  },
  {
    id: "ECE",
    label: "ECE",
    fullName: "Electronics & Communication",
    icon: "📡",
    gradient: "from-purple-500/20 to-pink-500/20",
    glow: "shadow-glow-purple",
    border: "border-purple-500/40",
  },
  {
    id: "EEE",
    label: "EEE",
    fullName: "Electrical & Electronics",
    icon: "⚡",
    gradient: "from-yellow-500/20 to-orange-500/20",
    glow: "",
    border: "border-yellow-500/40",
  },
  {
    id: "AI & DS",
    label: "AI & DS",
    fullName: "AI & Data Science",
    icon: "🤖",
    gradient: "from-cyan-500/20 to-blue-500/20",
    glow: "shadow-glow-cyan",
    border: "border-cyan-500/40",
  },
  {
    id: "AI & ML",
    label: "AI & ML",
    fullName: "AI & Machine Learning",
    icon: "🧠",
    gradient: "from-violet-500/20 to-purple-500/20",
    glow: "shadow-glow-purple",
    border: "border-violet-500/40",
  },
  {
    id: "CIVIL",
    label: "CIVIL",
    fullName: "Civil Engineering",
    icon: "🏗️",
    gradient: "from-stone-500/20 to-amber-500/20",
    glow: "",
    border: "border-amber-500/40",
  },
  {
    id: "MECH",
    label: "MECH",
    fullName: "Mechanical Engineering",
    icon: "⚙️",
    gradient: "from-slate-500/20 to-zinc-500/20",
    glow: "",
    border: "border-slate-500/40",
  },
  {
    id: "IT",
    label: "IT",
    fullName: "Information Technology",
    icon: "🖥️",
    gradient: "from-emerald-500/20 to-teal-500/20",
    glow: "",
    border: "border-emerald-500/40",
  },
];

const PROJECT_IDEAS: Record<string, string[]> = {
  CSE: [
    "AI Chatbot",
    "Smart Attendance System",
    "Resume Builder",
    "Web-based Compiler",
    "Inventory Management",
    "Library Management",
  ],
  ECE: [
    "IoT Smart Home",
    "Wireless Communication System",
    "Embedded Monitoring System",
    "Vehicle Tracking System",
  ],
  EEE: [
    "Smart Energy Meter",
    "Solar Monitoring System",
    "Power Optimization System",
    "Load Forecasting",
  ],
  "AI & DS": [
    "AI Prediction Models",
    "Face Recognition System",
    "Recommendation System",
    "NLP Chatbot",
    "Sentiment Analysis",
  ],
  "AI & ML": [
    "Face Recognition System",
    "AI Prediction Models",
    "NLP Chatbot",
    "Recommendation System",
    "Sentiment Analysis",
  ],
  CIVIL: [
    "Smart Traffic System",
    "Water Management System",
    "Structural Analysis Tool",
    "Construction Monitoring",
  ],
  MECH: [
    "Robotic Arm",
    "Automated Machine",
    "Solar Thermal System",
    "CNC Programming",
  ],
  IT: [
    "AI Chatbot",
    "Smart Attendance System",
    "Resume Builder",
    "Web-based Compiler",
    "Inventory Management",
    "Library Management",
  ],
};

// ─── Source Code Generator ────────────────────────────────────────────────────

function buildSourceFiles(
  dept: string,
  projectType: string,
  title: string,
): ProjectFile[] {
  const isWeb =
    ["CSE", "IT"].includes(dept) &&
    [
      "Resume Builder",
      "Web-based Compiler",
      "Library Management",
      "Inventory Management",
    ].includes(projectType);

  const isPython =
    ["AI & DS", "AI & ML", "CSE"].includes(dept) &&
    [
      "AI Chatbot",
      "AI Prediction Models",
      "Face Recognition System",
      "Recommendation System",
      "NLP Chatbot",
      "Sentiment Analysis",
    ].includes(projectType);

  const isEmbedded = ["ECE", "EEE"].includes(dept);
  const isMATLAB = ["EEE", "MECH"].includes(dept);

  if (isWeb) {
    return [
      {
        filename: "index.html",
        language: "html",
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header class="navbar">
    <div class="brand">🎓 ${title}</div>
    <nav>
      <a href="#home">Home</a>
      <a href="#features">Features</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>

  <main id="home" class="hero">
    <h1>${title}</h1>
    <p>A smart academic project for students.</p>
    <button class="btn-primary" onclick="init()">Get Started</button>
  </main>

  <section id="features" class="features-grid">
    <div class="feature-card">⚡ Fast</div>
    <div class="feature-card">📱 Responsive</div>
    <div class="feature-card">🔒 Secure</div>
    <div class="feature-card">🤖 AI-Powered</div>
  </section>

  <footer>
    <p>© 2026 ${title} | Built with AI THOZHANX 2.O</p>
  </footer>
  <script src="app.js"></script>
</body>
</html>`,
      },
      {
        filename: "style.css",
        language: "css",
        code: `/* ${title} - Main Stylesheet */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --blue: #3b82f6;
  --purple: #8b5cf6;
  --cyan: #06b6d4;
  --bg: #0a0b14;
  --surface: rgba(255,255,255,0.05);
  --border: rgba(255,255,255,0.08);
  --text: #f1f5f9;
  --muted: #94a3b8;
}

body { font-family: 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); }

.navbar {
  position: sticky; top: 0; z-index: 50;
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 2rem;
  background: rgba(10,11,20,0.8); backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}

.hero {
  min-height: 90vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center; padding: 2rem;
  background: radial-gradient(circle at 50% 50%, rgba(139,92,246,0.1), transparent 60%);
}

h1 {
  font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--blue), var(--purple), var(--cyan));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

.btn-primary {
  background: linear-gradient(135deg, var(--blue), var(--purple));
  color: white; border: none; padding: 0.8rem 2rem; border-radius: 50px;
  font-size: 1rem; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(139,92,246,0.4); }

.features-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem; padding: 4rem 2rem; background: rgba(255,255,255,0.02);
}

.feature-card {
  padding: 2rem; border-radius: 1rem; text-align: center; font-size: 1.1rem;
  background: var(--surface); border: 1px solid var(--border);
  backdrop-filter: blur(10px); transition: transform 0.3s;
}
.feature-card:hover { transform: translateY(-4px); }

footer { text-align: center; padding: 2rem; color: var(--muted); }`,
      },
      {
        filename: "app.js",
        language: "javascript",
        code: `// ${title} — Frontend Logic
// Generated by AI THOZHANX 2.O

const API_URL = '/api';

class App {
  constructor() {
    this.state = { user: null, data: [] };
    this.init();
  }

  init() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });
    console.log('[${title}] Application initialized');
    this.loadData();
  }

  async loadData() {
    try {
      const response = await fetch(\`\${API_URL}/data\`);
      if (!response.ok) throw new Error('Network error');
      this.state.data = await response.json();
      this.render();
    } catch (err) {
      console.error('[App] Failed to load:', err);
      this.showError('Failed to load data. Using offline mode.');
    }
  }

  render() {
    const container = document.getElementById('data-container');
    if (!container) return;
    container.innerHTML = this.state.data
      .map(item => \`<div class="data-item">\${item.name}</div>\`)
      .join('');
  }

  showError(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
}

function init() { window.app = new App(); }
document.addEventListener('DOMContentLoaded', init);`,
      },
      {
        filename: "database.sql",
        language: "sql",
        code: `-- ${title} — Database Schema
-- Department: ${dept} | Generated by AI THOZHANX 2.O

CREATE DATABASE IF NOT EXISTS ${title.toLowerCase().replace(/\s+/g, "_")}_db;
USE ${title.toLowerCase().replace(/\s+/g, "_")}_db;

-- Users table
CREATE TABLE users (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin', 'student', 'faculty') DEFAULT 'student',
  department  VARCHAR(50) DEFAULT '${dept}',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Items / Records table
CREATE TABLE records (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  user_id     INT NOT NULL,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  status      ENUM('active', 'inactive', 'pending') DEFAULT 'active',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Activity log
CREATE TABLE activity_log (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  user_id    INT,
  action     VARCHAR(100),
  details    TEXT,
  ip_address VARCHAR(45),
  logged_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed data
INSERT INTO users (name, email, password, role) VALUES
  ('Admin User', 'admin@college.edu', SHA2('admin123', 256), 'admin'),
  ('John Student', 'john@college.edu', SHA2('student123', 256), 'student');`,
      },
    ];
  }

  if (isPython) {
    return [
      {
        filename: "main.py",
        language: "python",
        code: `# ${title}
# Department: ${dept} | Generated by AI THOZHANX 2.O

import os
import sys
from pathlib import Path
from model import Model
from utils import preprocess, evaluate
from config import Config

def main():
    """Main entry point for ${title}"""
    print(f"[INFO] Starting ${title}")
    print(f"[INFO] Department: ${dept}")

    cfg = Config()
    model = Model(cfg)

    # Load and preprocess data
    print("[INFO] Loading dataset...")
    data = preprocess("data/dataset.csv", cfg)
    X_train, X_test, y_train, y_test = data

    # Train model
    print("[INFO] Training model...")
    model.train(X_train, y_train)

    # Evaluate
    metrics = evaluate(model, X_test, y_test)
    print(f"[RESULT] Accuracy: {metrics['accuracy']:.4f}")
    print(f"[RESULT] Precision: {metrics['precision']:.4f}")
    print(f"[RESULT] Recall: {metrics['recall']:.4f}")
    print(f"[RESULT] F1-Score: {metrics['f1']:.4f}")

    # Save model
    model.save(cfg.MODEL_PATH)
    print(f"[INFO] Model saved to {cfg.MODEL_PATH}")

if __name__ == "__main__":
    main()`,
      },
      {
        filename: "model.py",
        language: "python",
        code: `# Model Definition — ${title}
import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
import tensorflow as tf
from tensorflow import keras

class Model:
    """Main ML model for ${title}"""

    def __init__(self, config):
        self.config = config
        self.model = self._build_model()
        self.is_trained = False

    def _build_model(self):
        if self.config.MODEL_TYPE == "rf":
            return RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
        # Deep learning model
        model = keras.Sequential([
            keras.layers.Dense(128, activation='relu', input_shape=(self.config.INPUT_DIM,)),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(64, activation='relu'),
            keras.layers.Dropout(0.2),
            keras.layers.Dense(32, activation='relu'),
            keras.layers.Dense(self.config.NUM_CLASSES, activation='softmax')
        ])
        model.compile(
            optimizer=keras.optimizers.Adam(lr=0.001),
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        return model

    def train(self, X_train, y_train):
        print(f"[Model] Training on {len(X_train)} samples...")
        self.model.fit(X_train, y_train,
                       epochs=self.config.EPOCHS,
                       batch_size=self.config.BATCH_SIZE,
                       validation_split=0.2,
                       verbose=1)
        self.is_trained = True

    def predict(self, X):
        if not self.is_trained:
            raise RuntimeError("Model must be trained before prediction")
        return self.model.predict(X)

    def save(self, path: str):
        with open(path, 'wb') as f:
            pickle.dump(self.model, f)
        print(f"[Model] Saved to {path}")

    @classmethod
    def load(cls, path: str):
        with open(path, 'rb') as f:
            return pickle.load(f)`,
      },
      {
        filename: "utils.py",
        language: "python",
        code: `# Utilities — ${title}
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

def preprocess(filepath: str, config):
    """Load, clean, and split dataset"""
    df = pd.read_csv(filepath)
    print(f"[Utils] Loaded {len(df)} rows, {len(df.columns)} columns")

    # Drop missing values
    df = df.dropna()

    # Encode categorical columns
    le = LabelEncoder()
    for col in df.select_dtypes(include='object').columns:
        df[col] = le.fit_transform(df[col])

    X = df.drop(columns=[config.TARGET_COLUMN])
    y = df[config.TARGET_COLUMN]

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)

def evaluate(model, X_test, y_test) -> dict:
    """Compute evaluation metrics"""
    y_pred = model.predict(X_test)
    if hasattr(y_pred[0], '__len__'):
        y_pred = y_pred.argmax(axis=1)
    return {
        "accuracy":  accuracy_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred, average='weighted'),
        "recall":    recall_score(y_test, y_pred, average='weighted'),
        "f1":        f1_score(y_test, y_pred, average='weighted'),
    }

def plot_confusion_matrix(y_true, y_pred, labels, output_path="confusion_matrix.png"):
    """Generate and save confusion matrix plot"""
    import matplotlib.pyplot as plt
    from sklearn.metrics import ConfusionMatrixDisplay
    cm = ConfusionMatrixDisplay.from_predictions(y_true, y_pred, display_labels=labels)
    cm.ax_.set_title("Confusion Matrix")
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    print(f"[Utils] Confusion matrix saved to {output_path}")`,
      },
      {
        filename: "requirements.txt",
        language: "text",
        code: `# ${title} — Python Dependencies
# Generated by AI THOZHANX 2.O

numpy>=1.24.0
pandas>=2.0.3
scikit-learn>=1.3.2
tensorflow>=2.13.0
keras>=2.13.1
matplotlib>=3.7.2
seaborn>=0.12.2
flask>=3.0.0
flask-cors>=4.0.0
opencv-python>=4.8.1
pillow>=10.1.0
python-dotenv>=1.0.0
requests>=2.31.0
scipy>=1.11.0
joblib>=1.3.2`,
      },
    ];
  }

  if (isEmbedded) {
    return [
      {
        filename: "main.c",
        language: "c",
        code: `/* ${title}
 * Department: ${dept}
 * Microcontroller: Arduino Uno / ATmega328P
 * Generated by AI THOZHANX 2.O
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "config.h"
#include "sensor.h"

/* Global state */
static SystemState g_state = { .initialized = 0, .error_code = 0 };

/* Forward declarations */
static void system_init(void);
static void process_sensor_data(SensorData *data);
static void transmit_data(const char *payload);
static void handle_error(uint8_t code);

int main(void) {
    system_init();
    printf("[INFO] ${title} started\\n");

    SensorData sensor;
    char tx_buffer[TX_BUF_SIZE];

    while (1) {
        /* Read sensors */
        if (sensor_read(&sensor) != SENSOR_OK) {
            handle_error(ERR_SENSOR_READ);
            continue;
        }

        /* Process and validate */
        process_sensor_data(&sensor);

        /* Transmit via UART/MQTT */
        snprintf(tx_buffer, sizeof(tx_buffer),
                 "{\\"temp\\":%.2f,\\"humidity\\":%.2f,\\"status\\":%d}",
                 sensor.temperature, sensor.humidity, g_state.status);
        transmit_data(tx_buffer);

        delay_ms(SAMPLE_INTERVAL_MS);
    }

    return 0;
}

static void system_init(void) {
    uart_init(BAUD_RATE);
    sensor_init();
    timer_init();
    g_state.initialized = 1;
    g_state.status = STATUS_OK;
    printf("[INIT] System ready\\n");
}

static void process_sensor_data(SensorData *data) {
    if (data->temperature > TEMP_THRESHOLD) {
        g_state.status = STATUS_ALERT;
        trigger_alarm();
    } else {
        g_state.status = STATUS_OK;
    }
}

static void transmit_data(const char *payload) {
    uart_send_string(payload);
    uart_send_char('\\n');
}

static void handle_error(uint8_t code) {
    g_state.error_code = code;
    printf("[ERROR] Code: %d\\n", code);
    delay_ms(1000);
}`,
      },
      {
        filename: "config.h",
        language: "c",
        code: `/* config.h — ${title} Configuration
 * Department: ${dept} | AI THOZHANX 2.O
 */

#ifndef CONFIG_H
#define CONFIG_H

#include <stdint.h>

/* System version */
#define FIRMWARE_VERSION   "1.0.0"
#define PROJECT_NAME       "${title}"
#define DEPARTMENT         "${dept}"

/* UART Settings */
#define BAUD_RATE          9600
#define TX_BUF_SIZE        256

/* Sensor Thresholds */
#define TEMP_THRESHOLD     40.0f   /* °C */
#define HUMIDITY_MAX       85.0f   /* %  */
#define VOLTAGE_NOMINAL    5.0f    /* V  */

/* Timing */
#define SAMPLE_INTERVAL_MS 1000
#define WATCHDOG_TIMEOUT   8000

/* Status codes */
#define STATUS_OK          0x00
#define STATUS_ALERT       0x01
#define STATUS_ERROR       0xFF

/* Error codes */
#define ERR_NONE           0x00
#define ERR_SENSOR_READ    0x01
#define ERR_TRANSMIT       0x02
#define ERR_MEMORY         0x03

/* Types */
typedef struct {
    float    temperature;
    float    humidity;
    float    voltage;
    uint32_t timestamp;
} SensorData;

typedef struct {
    uint8_t initialized;
    uint8_t status;
    uint8_t error_code;
} SystemState;

#define SENSOR_OK          0
#define SENSOR_ERR        -1

#endif /* CONFIG_H */`,
      },
      {
        filename: "Makefile",
        language: "makefile",
        code: `# Makefile — ${title}
# Department: ${dept} | Generated by AI THOZHANX 2.O

CC       = avr-gcc
OBJCOPY  = avr-objcopy
AVRDUDE  = avrdude

MCU      = atmega328p
F_CPU    = 16000000UL
BAUD     = 9600
TARGET   = main
SRCS     = main.c sensor.c uart.c timer.c
OBJS     = $(SRCS:.c=.o)

CFLAGS   = -mmcu=$(MCU) -DF_CPU=$(F_CPU) -DBAUD=$(BAUD) \\
           -Os -Wall -Wextra -std=c11

all: $(TARGET).hex

$(TARGET).elf: $(OBJS)
\t$(CC) $(CFLAGS) -o $@ $^

$(TARGET).hex: $(TARGET).elf
\t$(OBJCOPY) -O ihex -R .eeprom $< $@

%.o: %.c
\t$(CC) $(CFLAGS) -c -o $@ $<

flash: $(TARGET).hex
\t$(AVRDUDE) -p $(MCU) -c arduino -P /dev/ttyUSB0 -b $(BAUD) \\
\t           -U flash:w:$(TARGET).hex

clean:
\trm -f $(OBJS) $(TARGET).elf $(TARGET).hex

.PHONY: all flash clean`,
      },
    ];
  }

  if (isMATLAB) {
    return [
      {
        filename: "main.m",
        language: "matlab",
        code: `% ${title}
% Department: ${dept} | Generated by AI THOZHANX 2.O
% Run this script to execute the full simulation

clc; clear all; close all;
fprintf('=== ${title} ===\\n');
fprintf('Department: ${dept}\\n\\n');

%% Parameters
params.dt    = 0.001;   % Time step (s)
params.t_end = 10;      % Simulation end time (s)
params.freq  = 50;      % Frequency (Hz)

%% Initialize
t = 0 : params.dt : params.t_end;
N = length(t);

signal  = zeros(1, N);
output  = zeros(1, N);
control = zeros(1, N);

%% Simulation loop
fprintf('[SIM] Running %d steps...\\n', N);
for i = 2:N
    signal(i)  = sin(2 * pi * params.freq * t(i));
    control(i) = pid_controller(signal(i), signal(i-1), params.dt);
    output(i)  = system_model(control(i), output(i-1), params.dt);
end

%% Results
fprintf('[RESULT] Peak output: %.4f\\n', max(abs(output)));
fprintf('[RESULT] Steady-state error: %.6f\\n', abs(signal(end) - output(end)));

%% Plot
figure('Name','${title}','Color',[0.1 0.1 0.15]);
subplot(2,1,1);
plot(t, signal, 'c', t, output, 'm', 'LineWidth', 1.5);
legend('Reference','Output'); xlabel('Time (s)'); ylabel('Amplitude');
title('System Response'); grid on;

subplot(2,1,2);
plot(t, control, 'Color', [0.4 0.6 1], 'LineWidth', 1.5);
xlabel('Time (s)'); ylabel('Control Signal');
title('Control Action'); grid on;`,
      },
      {
        filename: "pid_controller.m",
        language: "matlab",
        code: `function u = pid_controller(error, prev_error, dt)
% PID Controller for ${title}
% Kp, Ki, Kd tuned for ${dept} system characteristics

persistent integral_sum;
if isempty(integral_sum)
    integral_sum = 0;
end

% PID gains (tune as needed)
Kp = 2.5;
Ki = 0.8;
Kd = 0.15;

derivative  = (error - prev_error) / dt;
integral_sum = integral_sum + error * dt;

% Anti-windup
integral_sum = max(min(integral_sum, 10), -10);

u = Kp * error + Ki * integral_sum + Kd * derivative;

% Saturate output
u = max(min(u, 100), -100);
end`,
      },
      {
        filename: "system_model.m",
        language: "matlab",
        code: `function y_next = system_model(u, y_prev, dt)
% Second-order system model for ${title}
% Transfer function: G(s) = wn^2 / (s^2 + 2*zeta*wn*s + wn^2)

wn   = 10;    % Natural frequency (rad/s)
zeta = 0.5;   % Damping ratio

% State space discretization (Euler)
a = -2 * zeta * wn;
b = -wn^2;

dydt  = a * y_prev + b * y_prev + u;
y_next = y_prev + dt * dydt;
end`,
      },
    ];
  }

  // Generic Python fallback
  return [
    {
      filename: "main.py",
      language: "python",
      code: `# ${title}
# Department: ${dept} | Generated by AI THOZHANX 2.O

from config import Config
from core import ProjectCore

def main():
    cfg = Config()
    project = ProjectCore(cfg)
    project.initialize()
    project.run()

if __name__ == "__main__":
    main()`,
    },
    {
      filename: "core.py",
      language: "python",
      code: `# Core Module — ${title}
class ProjectCore:
    """Core business logic for ${title}"""

    def __init__(self, config):
        self.config = config
        self._ready = False

    def initialize(self):
        print(f"[INFO] Initializing ${title}")
        self._setup_dependencies()
        self._ready = True
        print("[INFO] System ready")

    def _setup_dependencies(self):
        print("[SETUP] Configuring modules...")

    def run(self):
        if not self._ready:
            raise RuntimeError("Call initialize() first")
        print("[RUN] Processing...")
        result = self._process()
        print(f"[RESULT] {result}")
        return result

    def _process(self):
        return {"status": "success", "department": "${dept}"}`,
    },
    {
      filename: "config.py",
      language: "python",
      code: `# Configuration — ${title}
import os

class Config:
    APP_NAME       = "${title}"
    DEPARTMENT     = "${dept}"
    DEBUG          = os.getenv("DEBUG", "True") == "True"
    SECRET_KEY     = os.getenv("SECRET_KEY", "thozhanx-2026")
    DB_HOST        = os.getenv("DB_HOST", "localhost")
    DB_PORT        = int(os.getenv("DB_PORT", "5432"))
    DB_NAME        = os.getenv("DB_NAME", "project_db")
    MODEL_PATH     = "models/model.pkl"
    LOG_LEVEL      = "INFO"`,
    },
    {
      filename: "requirements.txt",
      language: "text",
      code: `# ${title} — Requirements
numpy>=1.24.0
pandas>=2.0.0
scikit-learn>=1.3.0
flask>=3.0.0
python-dotenv>=1.0.0
requests>=2.31.0`,
    },
  ];
}

// ─── Diagram Generator ────────────────────────────────────────────────────────

function buildDiagrams(dept: string, title: string): string {
  return `SYSTEM ARCHITECTURE DIAGRAM
══════════════════════════════════════

┌─────────────────────────────────────────────────────┐
│                   ${title.slice(0, 40).padEnd(40)}   │
│                   SYSTEM ARCHITECTURE                │
└─────────────────────────────────────────────────────┘

┌──────────────┐     HTTP/WS     ┌──────────────────┐
│              │ ───────────►    │                  │
│   Frontend   │                 │  Backend Server  │
│   (React /   │ ◄───────────    │  (Python/Node)   │
│    HTML)     │     JSON        │                  │
└──────────────┘                 └────────┬─────────┘
                                          │
                                          │ SQL / ORM
                                          ▼
                                 ┌──────────────────┐
                                 │                  │
                                 │    Database      │
                                 │  (MySQL/MongoDB) │
                                 │                  │
                                 └──────────────────┘

──────────────────────────────────────────────────────

DATA FLOW DIAGRAM (Level 0 — Context Diagram)

                    ┌─────────────┐
  Input Data ──────►│             │──────► Output
                    │  ${dept.padEnd(9)} │
  User Request ────►│   System    │──────► Reports
                    │             │
  Sensor/API ──────►│             │──────► Alerts
                    └─────────────┘

──────────────────────────────────────────────────────

USE CASE DIAGRAM

  ┌──────────────────────────────────────┐
  │  System: ${title.slice(0, 30).padEnd(30)}  │
  │                                      │
  │  ○ Login / Authentication            │
  │  ○ Data Input & Validation           │
  │  ○ Core Processing / Analysis        │
  │  ○ Report Generation                 │
  │  ○ Export & Download                 │
  │  ○ Admin Dashboard                   │
  └──────────────────────────────────────┘
        ↑               ↑
   [Student]        [Admin/Faculty]

──────────────────────────────────────────────────────

ENTITY RELATIONSHIP DIAGRAM

  [User] ──── has many ────► [Records]
    │                           │
    └── belongs to ──► [Dept]   └── has ──► [Activity]

  User: id, name, email, role, dept, created_at
  Records: id, user_id, title, status, data, timestamp
  Dept: id, name, code, head
  Activity: id, user_id, action, timestamp

──────────────────────────────────────────────────────

SEQUENCE DIAGRAM — Core Flow

  User        Frontend       Backend        Database
   │               │              │               │
   │── Request ───►│              │               │
   │               │── API Call ─►│               │
   │               │              │── Query ─────►│
   │               │              │◄─ Result ─────│
   │               │◄─ Response ──│               │
   │◄── Render ────│              │               │
   │               │              │               │`;
}

// ─── PPT Generator ────────────────────────────────────────────────────────────

interface PptSlide {
  type: string;
  title: string;
  bullets: string[];
  color: string;
}

function buildPPTOutline(
  dept: string,
  projectType: string,
  title: string,
): PptSlide[] {
  return [
    {
      type: "Title Slide",
      title: title,
      bullets: [
        `Department: ${dept}`,
        "Final Year Project Presentation",
        "Submitted in partial fulfillment of B.E. / B.Tech degree",
        "Academic Year 2025–2026",
      ],
      color: "from-blue-500/20 to-purple-500/20",
    },
    {
      type: "Hook Slide",
      title: "Problem We Are Solving",
      bullets: [
        `📊 Current ${dept} systems lack intelligent automation`,
        "⚠️ Manual processes introduce 40% more errors",
        "🕐 Processing time 3× longer than needed",
        `💡 ${projectType} bridges this critical gap`,
      ],
      color: "from-orange-500/20 to-red-500/20",
    },
    {
      type: "Concept Slide",
      title: "Project Overview",
      bullets: [
        "✅ What the system does and how it works",
        "✅ Core architecture and component breakdown",
        "✅ Technologies and tools selected",
        "✅ Innovation compared to existing solutions",
      ],
      color: "from-purple-500/20 to-violet-500/20",
    },
    {
      type: "Technical Slide",
      title: "System Architecture",
      bullets: [
        "🔧 Three-tier architecture: UI → Logic → Data",
        "⚙️ Key modules and their interactions",
        "📡 Communication protocols & data flow",
        "🛡️ Security and performance considerations",
      ],
      color: "from-cyan-500/20 to-teal-500/20",
    },
    {
      type: "Results Slide",
      title: "Results & Testing",
      bullets: [
        "📈 System accuracy: 94.7% on test dataset",
        "⚡ Response time reduced by 65%",
        "💾 Memory usage optimized by 38%",
        "👥 User satisfaction score: 4.6 / 5.0",
      ],
      color: "from-green-500/20 to-emerald-500/20",
    },
    {
      type: "Demo Slide",
      title: "Screenshots & Demo",
      bullets: [
        "🖥️ Dashboard — main interface walkthrough",
        "📊 Data visualization & analytics panel",
        "⚙️ Admin control panel features",
        "📱 Mobile-responsive layout preview",
      ],
      color: "from-yellow-500/20 to-amber-500/20",
    },
    {
      type: "Summary Slide",
      title: "Conclusion & Future Work",
      bullets: [
        `🌟 ${title} successfully implemented and tested`,
        "🚀 Achieves all stated objectives with high accuracy",
        "🔮 Future: cloud deployment, mobile app, AI upgrade",
        "🙏 Thank you — Questions & Discussion",
      ],
      color: "from-pink-500/20 to-rose-500/20",
    },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

const STEPS = ["Choose Department", "Choose Project", "Generate"];

export default function ProjectPage() {
  const [step, setStep] = useState(0);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedProject, setSelectedProject] = useState("");
  const [customProject, setCustomProject] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProjectDocument | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedFile, setExpandedFile] = useState<number | null>(null);

  const deptProjects = selectedDept
    ? (PROJECT_IDEAS[selectedDept.id] ?? PROJECT_IDEAS.CSE)
    : [];

  const filteredProjects = deptProjects.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase()),
  );

  const finalProject =
    customProject.trim() || selectedProject || deptProjects[0] || "";

  const handleGenerate = async () => {
    if (!selectedDept || !finalProject) return;
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 3000));
    const doc = generateProject(selectedDept.id, finalProject);
    const richFiles = buildSourceFiles(
      selectedDept.id,
      finalProject,
      doc.title,
    );
    setResult({ ...doc, sourceFiles: richFiles });
    setLoading(false);
    setActiveTab("overview");
    setExpandedFile(null);
    toast.success("Complete project generated!", {
      description: `${richFiles.length} source files, 5 sections ready`,
    });
    setStep(3); // show output
  };

  const fullDoc = result
    ? [
        result.title,
        `Department: ${result.department}`,
        "",
        "ABSTRACT",
        result.abstract,
        "",
        "PROBLEM STATEMENT",
        result.problemStatement,
        "",
        "OBJECTIVES",
        ...result.objectives.map((o, i) => `${i + 1}. ${o}`),
        "",
        "TECHNOLOGIES",
        result.technologies.join(", "),
        "",
        "IMPLEMENTATION",
        result.implementation,
        "",
        "DOCUMENTATION",
        result.documentation,
      ].join("\n")
    : "";

  const handleReset = () => {
    setStep(0);
    setSelectedDept(null);
    setSelectedProject("");
    setCustomProject("");
    setSearch("");
    setResult(null);
    setLoading(false);
  };

  return (
    <div className="min-h-full p-4 md:p-6" data-ocid="project.page">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-glow-purple text-2xl">
            🧠
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl font-bold">
                Project Builder
              </h1>
              <Badge className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/40 text-violet-300 text-[11px] font-semibold tracking-wide uppercase">
                CORE FEATURE
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Complete engineering project documentation with source code
            </p>
          </div>
          {result && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="shrink-0 text-muted-foreground hover:text-foreground"
              data-ocid="project.reset.button"
            >
              <ChevronLeft size={14} className="mr-1" />
              New Project
            </Button>
          )}
        </div>

        {/* Wizard (only when no result) */}
        {!result && (
          <>
            {/* Step Progress */}
            <div className="glassmorphism rounded-2xl p-4">
              <div className="flex items-center gap-0">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-smooth",
                          i < step
                            ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-glow-purple"
                            : i === step
                              ? "bg-violet-500/20 border-2 border-violet-500/60 text-violet-300"
                              : "bg-muted/40 text-muted-foreground",
                        )}
                      >
                        {i < step ? "✓" : i + 1}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-medium hidden sm:block",
                          i === step
                            ? "text-violet-300"
                            : "text-muted-foreground",
                        )}
                      >
                        {s}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "h-0.5 flex-1 mx-2 rounded-full transition-smooth",
                          i < step ? "bg-violet-500/60" : "bg-white/10",
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 0: Choose Department */}
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <h2 className="font-display text-base font-semibold text-foreground">
                    Step 1 — Choose Your Department
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {DEPARTMENTS.map((dept, i) => (
                      <motion.button
                        key={dept.id}
                        type="button"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => {
                          setSelectedDept(dept);
                          setSelectedProject(PROJECT_IDEAS[dept.id]?.[0] ?? "");
                          setSearch("");
                        }}
                        data-ocid={`project.dept.card.${i + 1}`}
                        className={cn(
                          "glassmorphism rounded-xl p-4 flex flex-col items-center gap-2 transition-smooth hover:scale-105 cursor-pointer text-center",
                          selectedDept?.id === dept.id
                            ? `bg-gradient-to-br ${dept.gradient} ${dept.border} border-2 ${dept.glow}`
                            : "border border-white/10 hover:border-white/20",
                        )}
                      >
                        <span className="text-2xl">{dept.icon}</span>
                        <span className="font-display text-sm font-bold">
                          {dept.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-tight">
                          {dept.fullName}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      disabled={!selectedDept}
                      onClick={() => setStep(1)}
                      className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0"
                      data-ocid="project.step1.next_button"
                    >
                      Next — Choose Project
                      <ChevronRight size={16} className="ml-1.5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Choose Project */}
              {step === 1 && selectedDept && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{selectedDept.icon}</span>
                    <h2 className="font-display text-base font-semibold text-foreground">
                      Step 2 — Choose Project for{" "}
                      <span className="gradient-text">
                        {selectedDept.label}
                      </span>
                    </h2>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search projects..."
                      className="pl-9 bg-white/5 border-white/10 h-10"
                      data-ocid="project.search.input"
                    />
                  </div>

                  {/* Project grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredProjects.map((proj, i) => (
                      <button
                        key={proj}
                        type="button"
                        onClick={() => {
                          setSelectedProject(proj);
                          setCustomProject("");
                        }}
                        data-ocid={`project.idea.item.${i + 1}`}
                        className={cn(
                          "glassmorphism rounded-xl px-4 py-3 text-left transition-smooth hover:scale-[1.02] cursor-pointer",
                          selectedProject === proj && !customProject
                            ? `bg-gradient-to-r ${selectedDept.gradient} border-2 ${selectedDept.border}`
                            : "border border-white/10 hover:border-white/20",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles
                            size={13}
                            className={
                              selectedProject === proj && !customProject
                                ? "text-violet-300"
                                : "text-muted-foreground"
                            }
                          />
                          <span className="text-sm font-medium">{proj}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {filteredProjects.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No matches. Enter a custom name below.
                    </p>
                  )}

                  <Separator className="opacity-20" />

                  {/* Custom project */}
                  <div className="space-y-2">
                    <label
                      htmlFor="custom-project-input"
                      className="text-xs text-muted-foreground font-medium"
                    >
                      Or enter a custom project name:
                    </label>
                    <Input
                      id="custom-project-input"
                      value={customProject}
                      onChange={(e) => {
                        setCustomProject(e.target.value);
                        if (e.target.value) setSelectedProject("");
                      }}
                      placeholder="e.g. Blockchain-based Certificate Verification"
                      className="bg-white/5 border-white/10 h-10"
                      data-ocid="project.custom.input"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setStep(0)}
                      data-ocid="project.step2.back_button"
                    >
                      <ChevronLeft size={14} className="mr-1" />
                      Back
                    </Button>
                    <Button
                      disabled={!finalProject}
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0"
                      data-ocid="project.step2.next_button"
                    >
                      Next — Generate
                      <ChevronRight size={16} className="ml-1.5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Generate */}
              {step === 2 && selectedDept && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <h2 className="font-display text-base font-semibold">
                    Step 3 — Generate Your Project
                  </h2>

                  {/* Summary */}
                  <div className="glassmorphism rounded-2xl p-5 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{selectedDept.icon}</span>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Department
                        </p>
                        <p className="font-display font-semibold text-sm">
                          {selectedDept.fullName}
                        </p>
                      </div>
                    </div>
                    <Separator className="opacity-20" />
                    <div className="flex items-center gap-3">
                      <Sparkles
                        size={20}
                        className="text-violet-400 shrink-0"
                      />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Project Type
                        </p>
                        <p className="font-display font-semibold text-sm">
                          {finalProject}
                        </p>
                      </div>
                    </div>
                    <Separator className="opacity-20" />
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[
                        { label: "Source Files", value: "4–6" },
                        { label: "Sections", value: "5" },
                        { label: "Diagrams", value: "5" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="glassmorphism rounded-lg p-2"
                        >
                          <p className="font-display text-lg font-bold gradient-text">
                            {item.value}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Loading state */}
                  {loading && (
                    <div
                      className="glassmorphism rounded-2xl p-8 text-center space-y-4"
                      data-ocid="project.loading_state"
                    >
                      <div className="text-4xl animate-pulse">🧠</div>
                      <p className="font-display font-semibold">
                        Generating Complete Project…
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Building source code, documentation, diagrams & PPT
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                        {[
                          "Abstract",
                          "Problem Statement",
                          "Objectives",
                          "Source Code",
                          "Diagrams",
                          "PPT Outline",
                        ].map((step, i) => (
                          <motion.div
                            key={step}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.4 }}
                            className="flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1"
                          >
                            <div
                              className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse"
                              style={{ animationDelay: `${i * 0.3}s` }}
                            />
                            <span className="text-[11px] text-violet-300">
                              {step}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setStep(1)}
                      disabled={loading}
                      data-ocid="project.step3.back_button"
                    >
                      <ChevronLeft size={14} className="mr-1" />
                      Back
                    </Button>
                    <Button
                      onClick={handleGenerate}
                      disabled={loading || !finalProject}
                      className="flex-1 bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 text-white border-0 h-12 text-base font-semibold shadow-glow-purple"
                      data-ocid="project.generate.submit_button"
                    >
                      {loading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" />
                          Building Project…
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} className="mr-2" />
                          Generate Complete Project
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Empty state */}
        {!result && !loading && step === 0 && false && (
          <div
            className="glassmorphism rounded-2xl p-12 text-center"
            data-ocid="project.empty_state"
          >
            <div className="text-5xl mb-3">🏗️</div>
            <p className="text-sm text-muted-foreground">
              Select your department to get started
            </p>
          </div>
        )}

        {/* ── Result Output ── */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
            data-ocid="project.result.section"
          >
            {/* Title Bar */}
            <div className="glassmorphism rounded-2xl p-5 bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-2xl shrink-0">
                    {selectedDept?.icon ?? "📦"}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-bold leading-snug">
                      {result.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[11px]">
                        {result.department}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-cyan-500/30 text-cyan-300 text-[11px]"
                      >
                        {result.technologies.length} Technologies
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-green-500/30 text-green-300 text-[11px]"
                      >
                        {result.sourceFiles.length} Source Files
                      </Badge>
                    </div>
                  </div>
                </div>
                {/* Export Buttons */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(fullDoc).then(() =>
                        toast.success("Report copied!"),
                      )
                    }
                    data-ocid="project.copy.button"
                  >
                    <Copy size={13} className="mr-1.5" />
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const url = `${window.location.origin}${window.location.pathname}?dept=${encodeURIComponent(result.department)}&project=${encodeURIComponent(finalProject)}`;
                      copyToClipboard(url).then(() =>
                        toast.success("Share link copied!"),
                      );
                    }}
                    data-ocid="project.share.button"
                  >
                    <Share2 size={13} className="mr-1.5" />
                    Share
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0"
                    onClick={() =>
                      downloadText(
                        fullDoc,
                        `${result.department}-${finalProject}-project.txt`,
                      )
                    }
                    data-ocid="project.download_full.button"
                  >
                    <Download size={13} className="mr-1.5" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              data-ocid="project.tabs"
            >
              <TabsList className="glassmorphism border border-white/10 h-auto p-1 flex-wrap gap-1 w-full justify-start">
                {[
                  {
                    value: "overview",
                    icon: <BookOpen size={13} />,
                    label: "Overview",
                  },
                  {
                    value: "code",
                    icon: <Code2 size={13} />,
                    label: "Source Code",
                  },
                  {
                    value: "diagrams",
                    icon: <Shapes size={13} />,
                    label: "Diagrams",
                  },
                  {
                    value: "docs",
                    icon: <FileText size={13} />,
                    label: "Documentation",
                  },
                  {
                    value: "ppt",
                    icon: <Presentation size={13} />,
                    label: "PPT",
                  },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    data-ocid={`project.tab.${tab.value}`}
                    className="flex items-center gap-1.5 text-xs data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300"
                  >
                    {tab.icon}
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* ── Overview ── */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="glassmorphism rounded-xl p-5">
                    <h3 className="font-display text-sm font-semibold text-blue-400 mb-2">
                      📋 Abstract
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {result.abstract}
                    </p>
                  </div>
                  <div className="glassmorphism rounded-xl p-5">
                    <h3 className="font-display text-sm font-semibold text-orange-400 mb-2">
                      ⚠️ Problem Statement
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {result.problemStatement}
                    </p>
                  </div>
                </div>
                <div className="glassmorphism rounded-xl p-5">
                  <h3 className="font-display text-sm font-semibold text-purple-400 mb-3">
                    🎯 Objectives
                  </h3>
                  <ul className="space-y-2">
                    {result.objectives.map((obj, i) => (
                      <li
                        key={obj}
                        className="flex items-start gap-2.5 text-xs text-muted-foreground"
                        data-ocid={`project.objective.item.${i + 1}`}
                      >
                        <span className="shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-bold mt-0.5">
                          {i + 1}
                        </span>
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glassmorphism rounded-xl p-5">
                  <h3 className="font-display text-sm font-semibold text-cyan-400 mb-3">
                    🛠️ Technologies Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.technologies.map((tech) => (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="border-cyan-500/20 bg-cyan-500/5 text-cyan-300 text-[11px]"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="glassmorphism rounded-xl p-5">
                  <h3 className="font-display text-sm font-semibold text-emerald-400 mb-2">
                    📋 Overview
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {result.overview}
                  </p>
                </div>
                <div className="glassmorphism rounded-xl p-5">
                  <h3 className="font-display text-sm font-semibold text-amber-400 mb-2">
                    🗓️ Implementation Plan
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {result.implementation}
                  </p>
                </div>
              </TabsContent>

              {/* ── Source Code ── */}
              <TabsContent value="code" className="mt-4">
                <div
                  className="glassmorphism rounded-xl p-4 space-y-2"
                  data-ocid="project.source.section"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-sm font-semibold flex items-center gap-2">
                      <Code2 size={14} className="text-primary" />
                      Source Files ({result.sourceFiles.length})
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const code = result.sourceFiles
                          .map((f) => `// === ${f.filename} ===\n${f.code}`)
                          .join("\n\n");
                        downloadText(code, "source-code.txt");
                        toast.success("Source code downloaded!");
                      }}
                      data-ocid="project.download_code.button"
                    >
                      <Download size={13} className="mr-1.5" />
                      Download All
                    </Button>
                  </div>
                  {result.sourceFiles.map((file, i) => (
                    <div
                      key={file.filename}
                      className="rounded-lg border border-white/10 overflow-hidden"
                      data-ocid={`project.file.item.${i + 1}`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedFile(expandedFile === i ? null : i)
                        }
                        data-ocid={`project.file.toggle.${i + 1}`}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition-smooth text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-6 w-6 rounded bg-violet-500/20 flex items-center justify-center">
                            <Code2 size={11} className="text-violet-300" />
                          </div>
                          <span className="text-sm font-mono font-medium">
                            {file.filename}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] border-white/10 font-mono hidden sm:flex"
                          >
                            {file.language}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(file.code).then(() =>
                                toast.success(`${file.filename} copied!`),
                              );
                            }}
                            data-ocid={`project.file.copy.${i + 1}`}
                            className="p-1 rounded hover:bg-white/10 transition-smooth"
                          >
                            <Copy size={12} className="text-muted-foreground" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadText(file.code, file.filename);
                              toast.success(`${file.filename} downloaded!`);
                            }}
                            data-ocid={`project.file.download.${i + 1}`}
                            className="p-1 rounded hover:bg-white/10 transition-smooth"
                          >
                            <Download
                              size={12}
                              className="text-muted-foreground"
                            />
                          </button>
                          <ChevronRight
                            size={14}
                            className={cn(
                              "text-muted-foreground transition-smooth",
                              expandedFile === i && "rotate-90",
                            )}
                          />
                        </div>
                      </button>
                      {expandedFile === i && (
                        <ScrollArea className="max-h-80 bg-black/50">
                          <pre className="p-4 text-xs font-mono text-foreground/80 whitespace-pre leading-relaxed">
                            {file.code}
                          </pre>
                        </ScrollArea>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* ── Diagrams ── */}
              <TabsContent value="diagrams" className="mt-4">
                <div
                  className="glassmorphism rounded-xl p-5 space-y-4"
                  data-ocid="project.diagrams.section"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-semibold text-yellow-400">
                      📊 System Diagrams
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {result.diagrams.map((d) => (
                        <Badge
                          key={d}
                          variant="outline"
                          className="text-[10px] border-yellow-500/30 text-yellow-300"
                        >
                          {d}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator className="opacity-20" />
                  <ScrollArea className="max-h-[500px]">
                    <pre className="text-xs font-mono text-foreground/70 whitespace-pre leading-relaxed bg-black/30 rounded-lg p-5">
                      {buildDiagrams(result.department, result.title)}
                    </pre>
                  </ScrollArea>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20"
                    onClick={() => {
                      downloadText(
                        buildDiagrams(result.department, result.title),
                        "diagrams.txt",
                      );
                      toast.success("Diagrams downloaded!");
                    }}
                    data-ocid="project.download_diagrams.button"
                  >
                    <Download size={13} className="mr-1.5" />
                    Download Diagrams
                  </Button>
                </div>
              </TabsContent>

              {/* ── Documentation ── */}
              <TabsContent value="docs" className="mt-4 space-y-4">
                <div
                  className="glassmorphism rounded-xl p-5"
                  data-ocid="project.docs.section"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-sm font-semibold text-rose-400">
                      📝 Full Documentation
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(result.documentation).then(() =>
                          toast.success("Documentation copied!"),
                        )
                      }
                      data-ocid="project.copy_docs.button"
                    >
                      <Copy size={13} className="mr-1.5" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {result.documentation}
                  </p>
                </div>
                {/* SRS Overview */}
                <div className="glassmorphism rounded-xl p-5 space-y-3">
                  <h3 className="font-display text-sm font-semibold text-blue-400">
                    📋 SRS — Software Requirements Specification
                  </h3>
                  {[
                    {
                      label: "Functional Requirements",
                      items: [
                        "User authentication and role-based access control",
                        "Core processing module with real-time feedback",
                        "Data visualization and reporting dashboard",
                        "Export to PDF, CSV, and JSON formats",
                        "Admin panel for user and content management",
                      ],
                    },
                    {
                      label: "Non-Functional Requirements",
                      items: [
                        "Response time < 2 seconds for 95% of requests",
                        "System availability: 99.5% uptime",
                        "Support for 100 concurrent users",
                        "Mobile-responsive design (320px–2560px)",
                        "HTTPS encryption for all data in transit",
                      ],
                    },
                  ].map((section) => (
                    <div key={section.label}>
                      <p className="text-xs font-semibold text-foreground/80 mb-1.5">
                        {section.label}
                      </p>
                      <ul className="space-y-1">
                        {section.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2 text-xs text-muted-foreground"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0 mt-1" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* ── PPT ── */}
              <TabsContent value="ppt" className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    🎯 Presentation Outline (
                    {
                      buildPPTOutline(
                        result.department,
                        finalProject,
                        result.title,
                      ).length
                    }{" "}
                    slides)
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const slides = buildPPTOutline(
                        result.department,
                        finalProject,
                        result.title,
                      );
                      const content = slides
                        .map(
                          (s, i) =>
                            `SLIDE ${i + 1}: ${s.type}\n${s.title}\n${s.bullets.map((b) => `  • ${b}`).join("\n")}`,
                        )
                        .join("\n\n");
                      downloadText(content, "presentation-outline.txt");
                      toast.success("PPT outline downloaded!");
                    }}
                    data-ocid="project.download_ppt.button"
                  >
                    <Download size={13} className="mr-1.5" />
                    Download
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {buildPPTOutline(
                    result.department,
                    finalProject,
                    result.title,
                  ).map((slide, i) => (
                    <motion.div
                      key={slide.type}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      data-ocid={`project.slide.item.${i + 1}`}
                      className={cn(
                        "glassmorphism rounded-xl p-4 bg-gradient-to-br",
                        slide.color,
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Slide {i + 1}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[9px] border-white/10"
                        >
                          {slide.type}
                        </Badge>
                      </div>
                      <p className="font-display text-sm font-bold mb-2">
                        {slide.title}
                      </p>
                      <ul className="space-y-0.5">
                        {slide.bullets.map((b) => (
                          <li
                            key={b}
                            className="text-[11px] text-muted-foreground"
                          >
                            {b}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Bottom Export Bar */}
            <div className="glassmorphism rounded-2xl p-4 flex flex-wrap gap-3">
              <Button
                className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 min-w-[140px]"
                onClick={() =>
                  downloadText(
                    fullDoc,
                    `${result.department}-${finalProject}-full-project.txt`,
                  )
                }
                data-ocid="project.export_pdf.button"
              >
                <Download size={14} className="mr-2" />
                Download Full PDF
              </Button>
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 flex-1 min-w-[120px]"
                onClick={() => {
                  const code = result.sourceFiles
                    .map((f) => `// === ${f.filename} ===\n${f.code}`)
                    .join("\n\n");
                  downloadText(code, "source-code.txt");
                  toast.success("Source code downloaded!");
                }}
                data-ocid="project.export_code.button"
              >
                <Code2 size={14} className="mr-2" />
                Source Code
              </Button>
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 flex-1 min-w-[120px]"
                onClick={() => {
                  const slides = buildPPTOutline(
                    result.department,
                    finalProject,
                    result.title,
                  );
                  const txt = slides
                    .map(
                      (s, i) =>
                        `SLIDE ${i + 1}: ${s.type}\n${s.title}\n${s.bullets.map((b) => `  • ${b}`).join("\n")}`,
                    )
                    .join("\n\n");
                  downloadText(txt, "presentation.txt");
                  toast.success("PPT outline downloaded!");
                }}
                data-ocid="project.export_ppt.button"
              >
                <Presentation size={14} className="mr-2" />
                PPT Outline
              </Button>
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 flex-1 min-w-[100px]"
                onClick={() => {
                  const url = `${window.location.origin}${window.location.pathname}?dept=${encodeURIComponent(result.department)}&project=${encodeURIComponent(finalProject)}`;
                  copyToClipboard(url).then(() =>
                    toast.success("Share link copied!"),
                  );
                }}
                data-ocid="project.export_share.button"
              >
                <Link2 size={14} className="mr-2" />
                Share Link
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
