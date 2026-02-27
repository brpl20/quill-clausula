import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { register } from '../src/index.js';

register();

const quill = new Quill('#editor-container', {
  theme: 'snow',
  modules: {
    toolbar: [
      [
        {
          clausula: [
            'clausula',
            'subclausula',
            'paragrafo',
            'inciso',
            'alinea',
            false,
          ],
        },
        {
          parte: ['contratante', 'contratado', false],
        },
      ],
      ['objeto', 'assinatura'],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean'],
    ],
    clausula: {
      clausulaFormat: 'extenso',
      subclausulaFormat: 'dotted',
      paragrafoFormat: 'extenso',
      incisoFormat: 'roman',
      alineaFormat: 'letter-parenthesis',
      currentUser: 'user1',
      users: ['user1', 'user2'],
    },
  },
});

// Load sample legal content with PARTES, OBJETO, clausulas, and ASSINATURA
const sampleDelta = {
  ops: [
    // PARTES
    {
      insert:
        'João da Silva, brasileiro, casado, empresário, inscrito(a) no CPF sob o nº 123.456.789-00, RG nº 12.345.678-9, residente e domiciliado(a) em Rua das Flores, 123, São Paulo/SP\n',
      attributes: { parte: 'contratante' },
    },
    {
      insert:
        'Maria Oliveira, brasileira, solteira, advogada, inscrita no CPF sob o nº 987.654.321-00, RG nº 98.765.432-1, residente e domiciliada em Av. Paulista, 456, São Paulo/SP\n',
      attributes: { parte: 'contratado' },
    },

    // OBJETO
    {
      insert: 'Prestação de serviços de consultoria jurídica\n',
      attributes: { objeto: 'true' },
    },

    // Clausulas
    { insert: 'Do Objeto\n', attributes: { clausula: 'clausula' } },
    {
      insert:
        'O presente contrato tem por objeto a prestação de serviços de consultoria jurídica.\n',
      attributes: { clausula: 'subclausula' },
    },
    {
      insert: 'Os serviços serão prestados de forma presencial e remota.\n',
      attributes: { clausula: 'subclausula' },
    },
    {
      insert:
        'As partes acordam que o prazo de vigência será de 12 (doze) meses.\n',
      attributes: { clausula: 'paragrafo' },
    },
    {
      insert: 'Em parcelas mensais e consecutivas\n',
      attributes: { clausula: 'inciso' },
    },
    {
      insert: 'Com vencimento no quinto dia útil de cada mês\n',
      attributes: { clausula: 'inciso' },
    },
    {
      insert: 'mediante depósito bancário\n',
      attributes: { clausula: 'alinea' },
    },
    {
      insert: 'ou transferência via PIX\n',
      attributes: { clausula: 'alinea' },
    },
    { insert: 'Do Preço e Pagamento\n', attributes: { clausula: 'clausula' } },
    {
      insert:
        'O valor total do contrato é de R$ 120.000,00 (cento e vinte mil reais).\n',
      attributes: { clausula: 'subclausula' },
    },
    {
      insert: 'O pagamento será realizado conforme cronograma anexo.\n',
      attributes: { clausula: 'paragrafo' },
    },
    {
      insert:
        'Em caso de atraso, incidirá multa de 2% sobre o valor da parcela.\n',
      attributes: { clausula: 'paragrafo' },
    },
    {
      insert: 'Das Obrigações das Partes\n',
      attributes: { clausula: 'clausula' },
    },
    {
      insert: 'A CONTRATADA obriga-se a prestar os serviços com diligência.\n',
      attributes: { clausula: 'subclausula' },
    },
    {
      insert:
        'Este parágrafo é único, demonstrando a regra do Parágrafo Único.\n',
      attributes: { clausula: 'paragrafo' },
    },

    // ASSINATURA
    {
      insert: {
        assinatura: { local: 'São Paulo/SP', dataAssinatura: '27 de fevereiro de 2026', testemunhas: 2 },
      },
    },
    { insert: '\n' },
  ],
};

quill.setContents(sampleDelta as any);

// Delta viewer toggle
const deltaToggle = document.getElementById('delta-toggle')!;
const deltaOutput = document.getElementById('delta-output')!;

deltaToggle.addEventListener('click', () => {
  const open = deltaOutput.classList.toggle('open');
  deltaToggle.setAttribute('aria-expanded', String(open));
  if (open) updateDelta();
});

function updateDelta() {
  deltaOutput.textContent = JSON.stringify(quill.getContents(), null, 2);
}
quill.on('text-change', () => {
  if (deltaOutput.classList.contains('open')) updateDelta();
});

// Format config controls
const controls = document.getElementById('format-controls')!;
controls.addEventListener('change', (e) => {
  const target = e.target as HTMLSelectElement;
  const formatKey = target.getAttribute('data-format');
  if (!formatKey) return;

  const mod = quill.getModule('clausula') as any;
  if (mod) {
    mod.options[formatKey] = target.value;
    mod.renumber();
  }
});
