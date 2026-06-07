import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_PATH = path.join(__dirname, "data", "settings.json");

const app = express();

app.use(cors());
app.use(express.json());

async function getSettings() {
    try {
        const data = await fs.readFile(SETTINGS_PATH, "utf-8");
        return JSON.parse(data);
    } catch {
        return {
            primaryColor: "#008d80",
            primaryColorEnd: "#00bfa6",
            gradientDirection: "to right",
            glowIntensity: "medium",
            borderRadius: "14px",
            chatbotWelcome: "Salom! Men yuridik yordamchiman. Savolingizni yozing...",
            contactInfo: { phone: "", address: "", telegram: "", instagram: "" },
            texts: { uz: {}, ru: {} },
            telegramBotToken: "",
            telegramChatId: "",
            openaiApiKey: "",
            feedbacks: [
                { name: "Ибрагимова Нурида", text: "Руководитель департамента\nконтроля качества", avatar: "" },
                { name: "Проскурова Елена", text: "Руководитель практики частного\nправа", avatar: "" },
                { name: "Титов Александр", text: "Ведущий юрист практики\nжилищного права и социальных\nотношений", avatar: "" }
            ],
            pendingFeedbacks: []
        };
    }
}

function normalizeText(text = "") {
    return text.toLowerCase().trim();
}

function companyReply(text) {
    return {
        reply: text,
    };
}

function sanitizeReply(reply = "") {
    const badPhrases = [
        "я бот",
        "я — бот",
        "я чат-бот",
        "я — чат-бот",
        "chatgpt",
        "openai",
        "искусственный интеллект",
        "я ассистент",
        "я виртуальный помощник",
        "созданный компанией openai",
    ];

    const lowered = reply.toLowerCase();

    const hasBadPhrase = badPhrases.some((phrase) => lowered.includes(phrase));

    if (hasBadPhrase) {
        return "Мы — юридическая компания KHAMIDOV.UZ. Помогаем по вопросам долгов, документов и юридических консультаций. Опишите вашу ситуацию, и мы подскажем, как лучше решить вопрос.";
    }

    return reply;
}

function getStaticReply(message) {
    const msg = normalizeText(message);

    if (!msg) {
        return "Опишите ваш вопрос, и мы постараемся помочь.";
    }

    if (
        msg.includes("кто ты") ||
        msg.includes("ты кто") ||
        msg.includes("вы кто") ||
        msg.includes("ты бот") ||
        msg.includes("вы бот")
    ) {
        return "Мы — юридическая компания KHAMIDOV.UZ. Помогаем по вопросам долгов, документов и юридических консультаций. Чем можем помочь?";
    }

    if (
        msg.includes("цена") ||
        msg.includes("стоимость") ||
        msg.includes("сколько стоит")
    ) {
        return "Стоимость зависит от вашей ситуации и объёма работы. Опишите ваш вопрос, и мы сориентируем вас подробнее. Также вы можете оставить номер, и мы свяжемся с вами в течение 7 минут 📞";
    }

    if (
        msg.includes("контакт") ||
        msg.includes("номер") ||
        msg.includes("телефон") ||
        msg.includes("связаться")
    ) {
        return "Оставьте ваш номер, и наш специалист свяжется с вами в течение 7 минут 📞";
    }

    if (
        msg.includes("банкрот") ||
        msg.includes("долг") ||
        msg.includes("кредит") ||
        msg.includes("задолж")
    ) {
        return "Мы помогаем по вопросам банкротства, долгов и кредитной нагрузки. Опишите вашу ситуацию подробнее, и мы подскажем возможные варианты решения.";
    }

    return null;
}

app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body ?? {};

        if (!message || typeof message !== "string") {
            return res.status(400).json(companyReply("Пожалуйста, напишите ваш вопрос текстом."));
        }

        const staticReply = getStaticReply(message);
        if (staticReply) {
            return res.json(companyReply(staticReply));
        }

        const settings = await getSettings();
        const apiKey = settings.openaiApiKey || process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(500).json(companyReply("OpenAI API Key is not configured."));
        }

        const client = new OpenAI({ apiKey });

        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.3,
            messages: [
                {
                    role: "system",
                    content: `
Вы представляете юридическую компанию KHAMIDOV.UZ.

Очень важные правила:
- Всегда отвечайте только от имени компании.
- Используйте "мы", "наши специалисты", "наша компания".
- Никогда не говорите: "я бот", "я ChatGPT", "я ассистент", "OpenAI", "искусственный интеллект".
- Не рассказывайте, кем вы созданы.
- Не выходите из роли консультанта компании.
- Пишите вежливо, уверенно, коротко и понятно.
- Обращайтесь к пользователю на "вы".
- Если вопрос связан с услугами, долгами, банкротством, документами или консультацией — мягко предлагайте оставить номер.
- Если вопрос общий, всё равно отвечайте от имени компании, без упоминания ИИ.

О компании:
- юридические консультации
- банкротство физических лиц
- списание долгов
- помощь с документами

Хорошие примеры:
- "Мы поможем вам разобраться в этом вопросе."
- "Наша компания занимается такими вопросами."
- "Оставьте номер, и мы свяжемся с вами в течение 7 минут 📞"

Плохие примеры:
- "Я бот..."
- "Я создан OpenAI..."
- "Я как ИИ..."
          `.trim(),
                },
                {
                    role: "user",
                    content: message,
                },
            ],
        });

        const rawReply = completion.choices?.[0]?.message?.content?.trim() || "";
        const safeReply = sanitizeReply(rawReply);

        return res.json(companyReply(safeReply));
    } catch (error) {
        console.error("CHAT ERROR:", error);

        return res.status(500).json(
            companyReply("Сервер временно недоступен. Пожалуйста, попробуйте чуть позже.")
        );
    }
});

app.get("/api/settings", async (req, res) => {
    try {
        const settings = await getSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: "Failed to read settings" });
    }
});

app.post("/api/order", async (req, res) => {
    try {
        const { name, phone, time, problem } = req.body;
        const settings = await getSettings();
        const botToken = settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
        const chatId = settings.telegramChatId || process.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            return res.status(500).json({ error: "Telegram API not configured" });
        }

        const text = `
📩 Новая заявка

👤 Имя: ${name || "Не указано"}
📞 Телефон: ${phone || "Не указано"}
⏰ Время: ${time || "Не указано"}
💬 Проблема: ${problem || "Не указано"}
        `.trim();

        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text })
        });

        if (!response.ok) {
            throw new Error("Telegram API error");
        }

        res.json({ success: true });
    } catch (error) {
        console.error("ORDER ERROR:", error);
        res.status(500).json({ error: "Failed to send order" });
    }
});

app.post("/api/settings", async (req, res) => {
    try {
        const { password, settings } = req.body;
        // Simple hardcoded password for the demo
        if (password !== "admin123") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
        await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");
        res.json({ success: true });
    } catch (error) {
        console.error("SETTINGS ERROR:", error);
        res.status(500).json({ error: "Failed to save settings" });
    }
});

app.post("/api/reviews", async (req, res) => {
    try {
        const { name, phone, text } = req.body;
        const settings = await getSettings();
        
        const newReview = {
            id: Date.now().toString(),
            name: name || "Не указано",
            phone: phone || "Не указано",
            text: text || "Не указано",
            date: new Date().toISOString()
        };

        if (!settings.pendingFeedbacks) {
            settings.pendingFeedbacks = [];
        }
        
        settings.pendingFeedbacks.push(newReview);
        await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");

        // Notify Telegram
        const botToken = settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
        const chatId = settings.telegramChatId || process.env.TELEGRAM_CHAT_ID;

        if (botToken && chatId) {
            const telegramText = `
⭐ Новый отзыв ожидает проверки!

👤 Имя: ${newReview.name}
📞 Телефон: ${newReview.phone}
💬 Отзыв: ${newReview.text}

Зайдите в панель администратора (khamidov.uz/admin), чтобы одобрить или отклонить.
            `.trim();

            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text: telegramText })
            }).catch(console.error);
        }

        res.json({ success: true });
    } catch (error) {
        console.error("REVIEW ERROR:", error);
        res.status(500).json({ error: "Failed to submit review" });
    }
});

if (process.env.NODE_ENV !== "production") {
    app.listen(4000, () => {
        console.log("Server running on http://localhost:4000");
    });
}

export default app;