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
      ],
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
    },
  },
});

// Load sample legal content
const sampleDelta = {
  ops: [
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
