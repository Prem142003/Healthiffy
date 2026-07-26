import { verifyEmailTransporter } from '../services/email.service.js';

const ok = await verifyEmailTransporter();
process.exit(ok ? 0 : 1);
