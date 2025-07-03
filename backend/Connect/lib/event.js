import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var Commands = [];
let config = {};
let language = {};
let reactData = {};

// Load configuration
try {
  const configPath = path.join(__dirname, '../config/config.json');
  config = await fs.readJson(configPath);
} catch (error) {
  console.error('Error loading config:', error);
  config = { LANGUAGE: 'EN', PREFIX: '.' };
}

// Load language strings
const loadLanguage = async () => {
  try {
    const langFile = config.LANGUAGE === 'SI' ? '../language/SINHALA.json' : '../language/ENGLISH.json';
    const langPath = path.join(__dirname, langFile);
    return await fs.readJson(langPath);
  } catch (error) {
    console.error('Error loading language:', error);
    return {};
  }
};

// Load react data
const loadReactData = async () => {
  try {
    const reactPath = path.join(__dirname, "../database/react/React.json");
    return await fs.readJson(reactPath);
  } catch (error) {
    console.error('Error loading react data:', error);
    return { STRINGS: { react: { INFO: ['ℹ️'] } } };
  }
};

// Initialize data
language = await loadLanguage();
reactData = await loadReactData();

const getString = (key) => {
  return language.STRINGS && language.STRINGS[key] ? language.STRINGS[key] : key;
};

const reactArry = async (text = "INFO") => {
  const reactions = reactData.STRINGS.react[text] || reactData.STRINGS.react["INFO"];
  return reactions[Math.floor(Math.random() * reactions.length)];
};

const successfulMessage = (msg) => `👩‍🦰 ${getString('SUCCESS')?.GENERAL || 'Successful'}:- ${msg}`;
const errorMessage = (msg) => `🚀 ${getString('ERRORS')?.GENERAL || 'Error'}:- ${msg}`;
const infoMessage = (msg) => `🤖 ${getString('INFO') || 'Info'}:- ${msg}`;

const categories = ["all", "group", "media", "download", "logo", "fun", "utility", "admin", "owner"];

function addCommand(info, func) {
  const types = ["photo", "image", "text", "message", "video", "audio", "document"];
  
  const infos = {
    pattern: info.pattern || [],
    category: info.category || "all",
    fromMe: info.fromMe !== undefined ? info.fromMe : true,
    onlyGroup: info.onlyGroup || false,
    onlyPm: info.onlyPm || false,
    onlyPinned: info.onlyPinned || false,
    React: info.React || "",
    adminOnly: info.adminOnly || false,
    ownerOnly: info.ownerOnly || false,
    groupAdminOnly: info.groupAdminOnly || false,
    desc: info.desc || "",
    usage: info.usage || "",
    filename: info.filename || "",
    function: func
  };

  if (info.on === undefined && info.pattern === undefined) {
    infos.on = "message";
    infos.fromMe = false;
  } else if (info.on !== undefined && types.includes(info.on)) {
    infos.on = info.on;
  }

  Commands.push(infos);
  return infos;
}

const Queen = {
  addCommand,
  getString,
  reactArry,
  successfulMessage,
  errorMessage,
  infoMessage,
  config
};

export {
  Queen,
  Commands as commands,
  addCommand,
  getString,
  reactArry,
  successfulMessage,
  errorMessage,
  infoMessage,
  categories
};