import { pool } from './src/db.js';

async function test() {
  let client;
  try {
    console.log('🔍 Testando conexão e funções do banco...\n');
    
    client = await pool.connect();
    
    // 1. Teste básico de conexão
    const connResult = await client.query('SELECT NOW() as agora, version() as versao');
    console.log('✅ Conexão com PostgreSQL OK');
    console.log(`   Hora do servidor: ${connResult.rows[0].agora}`);
    console.log(`   Versão: ${connResult.rows[0].versao.split(',')[0]}\n`);
    
    // 2. Liste todas as tabelas
    const tabelas = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 TABELAS NO BANCO:');
    tabelas.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.table_name}`);
    });
    console.log('');
    
    // 3. Verifique função fn_calcular_total
    console.log('🧪 TESTANDO FUNÇÃO fn_calcular_total:');
    
    // Primeiro veja a definição
    const funcDef = await client.query(`
      SELECT pg_get_functiondef(oid) as definicao
      FROM pg_proc 
      WHERE proname = 'fn_calcular_total' 
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      LIMIT 1
    `);
    
    if (funcDef.rows.length > 0) {
      const definicao = funcDef.rows[0].definicao;
      console.log('✅ Função encontrada');
      console.log(`📝 Assinatura: ${definicao.split('AS')[0].trim()}\n`);
      
      // Teste com um valor arbitrário
      try {
        const teste = await client.query('SELECT fn_calcular_total(1) as resultado');
        console.log(`🔢 Teste fn_calcular_total(1) = ${teste.rows[0].resultado}`);
      } catch (funcError) {
        console.log(`❌ Erro ao executar: ${funcError.message}`);
        
        // Talvez precise de uma locação real
        const locacoes = await client.query('SELECT id_locacao FROM locacao LIMIT 1');
        if (locacoes.rows.length > 0) {
          const idReal = locacoes.rows[0].id_locacao;
          const testeReal = await client.query(
            'SELECT fn_calcular_total($1) as resultado', 
            [idReal]
          );
          console.log(`🔢 Teste fn_calcular_total(${idReal}) = ${testeReal.rows[0].resultado}`);
        }
      }
    } else {
      console.log('❌ Função fn_calcular_total NÃO encontrada');
    }
    console.log('');
    
    // 4. Teste procedimento prc_gerar_parcelas
    console.log('🧪 TESTANDO PROCEDIMENTO prc_gerar_parcelas:');
    
    // Primeiro limpe parcelas antigas se houver
    try {
      await client.query('DELETE FROM parcela WHERE id_locacao = 9999');
    } catch (e) {
      // Ignora se não existir
    }
    
    // Teste com uma locação existente
    const locacaoParaTeste = await client.query(`
      SELECT l.id_locacao, c.nome as cliente
      FROM locacao l
      JOIN cliente c ON l.id_cliente = c.id_cliente
      WHERE l.status = 'Aberta'
      LIMIT 1
    `);
    
    if (locacaoParaTeste.rows.length > 0) {
      const idLoc = locacaoParaTeste.rows[0].id_locacao;
      const nomeCliente = locacaoParaTeste.rows[0].cliente;
      
      console.log(`📋 Usando locação ID ${idLoc} (${nomeCliente})`);
      
      try {
        await client.query('CALL prc_gerar_parcelas($1::integer, $2::integer)', [idLoc, 2]);
        console.log('✅ Procedimento executado com sucesso!');
        
        // Verifique parcelas criadas
        const parcelasCriadas = await client.query(
          'SELECT numero, valor, data_vencimento FROM parcela WHERE id_locacao = $1 ORDER BY numero',
          [idLoc]
        );
        
        console.log(`📊 Parcelas criadas: ${parcelasCriadas.rows.length}`);
        parcelasCriadas.rows.forEach(parcela => {
          console.log(`   Parcela ${parcela.numero}: R$ ${parcela.valor} - Venc: ${parcela.data_vencimento}`);
        });
        
      } catch (procError) {
        console.log(`❌ Erro: ${procError.message}`);
        
        // Tente alternativa
        console.log('🔄 Tentando alternativa...');
        try {
          await client.query('SELECT prc_gerar_parcelas($1, $2)', [idLoc, 2]);
          console.log('✅ Alternativa funcionou!');
        } catch (altError) {
          console.log(`❌ Alternativa também falhou: ${altError.message}`);
        }
      }
    } else {
      console.log('⚠️  Nenhuma locação "Aberta" encontrada para teste');
    }
    
    console.log('\n✅ Teste concluído!');
    
  } catch (error) {
    console.error('❌ ERRO GERAL:', error.message);
    console.error('Detalhes:', error);
  } finally {
    if (client) client.release();
    await pool.end();
    console.log('\n🔚 Conexão encerrada');
  }
}

test();