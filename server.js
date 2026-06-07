import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

dotenv.config();

const IS_VERCEL = process.env.VERCEL || process.env.NODE_ENV === "production";
const DEFAULT_SETTINGS_PATH = path.join(process.cwd(), "data", "settings.json");
const SETTINGS_PATH = IS_VERCEL ? path.join("/tmp", "settings.json") : DEFAULT_SETTINGS_PATH;

// Native Vercel Handler

async function getSettings() {
    try {
        const data = await fs.readFile(SETTINGS_PATH, "utf-8");
        return JSON.parse(data);
    } catch {
        try {
            const defaultData = await fs.readFile(DEFAULT_SETTINGS_PATH, "utf-8");
            return JSON.parse(defaultData);
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

const corsMiddleware = cors();

function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

export default async function handler(req, res) {
    await runMiddleware(req, res, corsMiddleware);

    const { url, method } = req;
    const path = url.split("?")[0];

    if (path === "/api/chat" && method === "POST") {
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
                        content: `Вы представляете юридическую компанию KHAMIDOV.UZ...`
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
            return res.status(500).json(companyReply("Сервер временно недоступен. Пожалуйста, попробуйте чуть позже."));
        }
    }

    if (path === "/api/settings" && method === "GET") {
        try {
            const settings = await getSettings();
            return res.json(settings);
        } catch (error) {
            return res.status(500).json({ error: "Failed to read settings" });
        }
    }

    if (path === "/api/settings" && method === "POST") {
        try {
            const { password, settings } = req.body || {};
            if (password !== "admin123") {
                return res.status(401).json({ error: "Unauthorized" });
            }
            if (!IS_VERCEL) {
                await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true });
            }
            await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");
            return res.json({ success: true });
        } catch (error) {
            console.error("SETTINGS ERROR:", error);
            return res.status(500).json({ error: "Failed to save settings" });
        }
    }

    if (path === "/api/order" && method === "POST") {
        try {
            const { name, phone, time, problem } = req.body || {};
            const settings = await getSettings();
            const botToken = settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
            const chatId = settings.telegramChatId || process.env.TELEGRAM_CHAT_ID;

            if (!botToken || !chatId) {
                return res.status(500).json({ error: "Telegram API not configured" });
            }

            const text = `📩 Новая заявка\n\n👤 Имя: ${name || "Не указано"}\n📞 Телефон: ${phone || "Не указано"}\n⏰ Время: ${time || "Не указано"}\n💬 Проблема: ${problem || "Не указано"}`;

            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text })
            });

            if (!response.ok) throw new Error("Telegram API error");

            return res.json({ success: true });
        } catch (error) {
            console.error("ORDER ERROR:", error);
            return res.status(500).json({ error: "Failed to send order" });
        }
    }

    if (path === "/api/reviews" && method === "POST") {
        try {
            const { name, phone, text } = req.body || {};
            const settings = await getSettings();
            
            const newReview = { id: Date.now().toString(), name: name || "Не указано", phone: phone || "Не указано", text: text || "Не указано", date: new Date().toISOString() };
            if (!settings.pendingFeedbacks) settings.pendingFeedbacks = [];
            settings.pendingFeedbacks.push(newReview);
            
            await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");

            const botToken = settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
            const chatId = settings.telegramChatId || process.env.TELEGRAM_CHAT_ID;

            if (botToken && chatId) {
                const telegramText = `⭐ Новый отзыв ожидает проверки!\n\n👤 Имя: ${newReview.name}\n📞 Телефон: ${newReview.phone}\n💬 Отзыв: ${newReview.text}`;
                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chatId, text: telegramText })
                }).catch(console.error);
            }

            return res.json({ success: true });
        } catch (error) {
            console.error("REVIEW ERROR:", error);
            return res.status(500).json({ error: "Failed to submit review" });
        }
    }

    return res.status(404).json({ error: "Not found" });
}