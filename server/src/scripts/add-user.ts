import { input, password, select } from '@inquirer/prompts';
import { pool } from '../db/index.js';
import {
  DuplicateEmailError,
  newMemberSchema,
  provisionUser,
} from '../lib/provision-user.js';

try {
  if (!process.stdin.isTTY) throw new Error('Use um terminal interativo.');
  const name = await input({
    message: 'Nome do familiar:',
    validate: (value) =>
      newMemberSchema.shape.name.safeParse(value).success ||
      'Informe um nome entre 2 e 100 caracteres.',
  });
  const email = await input({
    message: 'Email:',
    validate: (value) =>
      newMemberSchema.shape.email.safeParse(value).success ||
      'Informe um email válido.',
  });
  const secret = await password({
    message: 'Senha (12 a 128 caracteres):',
    mask: '*',
    validate: (value) =>
      newMemberSchema.shape.password.safeParse(value).success ||
      'A senha deve ter entre 12 e 128 caracteres.',
  });
  await password({
    message: 'Confirme a senha:',
    mask: '*',
    validate: (value) =>
      value === secret || 'As senhas não coincidem. Tente novamente.',
  });
  const familyName = await input({
    message: 'Nome da família (usado somente na primeira execução):',
    validate: (value) =>
      newMemberSchema.shape.familyName.safeParse(value).success ||
      'Informe um nome entre 2 e 100 caracteres.',
  });
  const role = await select({
    message: 'Permissão (o primeiro usuário será administrador):',
    choices: [
      { name: 'Membro', value: 'member' as const },
      { name: 'Administrador', value: 'admin' as const },
    ],
  });
  const created = await provisionUser({
    name,
    email,
    password: secret,
    familyName,
    role,
  });
  console.log(`Familiar cadastrado como ${created.role}.`);
} catch (error) {
  if (error instanceof DuplicateEmailError) {
    console.error('Cadastro não concluído: email já cadastrado.');
  } else if (!process.stdin.isTTY) {
    console.error('Cadastro não concluído: use um terminal interativo.');
  } else {
    console.error(
      'Não foi possível concluir o cadastro. Verifique a conexão com o banco e se o email já foi cadastrado antes de tentar novamente.',
    );
  }
  process.exitCode = 1;
} finally {
  await pool.end();
}
