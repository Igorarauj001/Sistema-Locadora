import { pool } from './src/db.js';

async function encontrarFuncoes() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 BUSCANDO FUNÇÕES NO BANCO...\n');
    
    // 1. Verifique o schema atual
    const schemaAtual = await client.query('SELECT current_schema()');
    console.log(`📌 Schema atual: ${schemaAtual.rows[0].current_schema}\n`);
    
    // 2. Liste todos os schemas disponíveis
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT LIKE 'pg_%' 
        AND schema_name != 'information_schema'
      ORDER BY schema_name
    `);
    
    console.log('📋 SCHEMAS DISPONÍVEIS:');
    schemas.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.schema_name}`);
    });
    console.log('');
    
    // 3. Busque funções específicas EM TODOS OS SCHEMAS
    console.log('🎯 BUSCANDO FUNÇÕES ESPECÍFICAS:');
    
    const funcoesProcuradas = await client.query(`
      SELECT 
        n.nspname as schema,
        p.proname as nome,
        CASE p.prokind 
          WHEN 'f' THEN 'FUNCTION' 
          WHEN 'p' THEN 'PROCEDURE' 
          ELSE 'OTHER' 
        END as tipo,
        pg_get_function_identity_arguments(p.oid) as argumentos
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE p.proname ILIKE '%calcular%'
         OR p.proname ILIKE '%total%'
         OR p.proname ILIKE '%parcela%'
         OR p.proname ILIKE '%fn_%'
         OR p.proname ILIKE '%prc_%'
      ORDER BY n.nspname, p.proname
    `);
    
    if (funcoesProcuradas.rows.length > 0) {
      console.log('✅ FUNÇÕES ENCONTRADAS:');
      funcoesProcuradas.rows.forEach((func, i) => {
        console.log(`\n   ${i + 1}. ${func.schema}.${func.nome}`);
        console.log(`      Tipo: ${func.tipo}`);
        console.log(`      Argumentos: ${func.argumentos || '(nenhum)'}`);
      });
    } else {
      console.log('❌ Nenhuma função encontrada com os padrões de busca');
    }
    
    console.log('\n📊 TOTAL DE FUNÇÕES POR SCHEMA:');
    const contagem = await client.query(`
      SELECT 
        n.nspname as schema,
        COUNT(*) as quantidade
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname NOT LIKE 'pg_%' 
        AND n.nspname != 'information_schema'
      GROUP BY n.nspname
      ORDER BY quantidade DESC
    `);
    
    contagem.rows.forEach(row => {
      console.log(`   ${row.schema}: ${row.quantidade} funções/procedimentos`);
    });
    
    // 4. Teste se conseguimos chamar alguma função de cálculo
    console.log('\n🧪 TESTANDO EXECUÇÃO:');
    
    // Primeiro crie uma função SIMPLES de teste se não existir
    try {
      await client.query(`
        CREATE OR REPLACE FUNCTION teste_soma(a integer, b integer)
        RETURNS integer AS $$
        BEGIN
          RETURN a + b;
        END;
        $$ LANGUAGE plpgsql
      `);
      
      const teste = await client.query('SELECT teste_soma(10, 5) as resultado');
      console.log(`✅ Função de teste criada e executada: 10 + 5 = ${teste.rows[0].resultado}`);
      
      // Limpe
      await client.query('DROP FUNCTION teste_soma(integer, integer)');
      
    } catch (e) {
      console.log(`⚠️  Não foi possível criar função de teste: ${e.message}`);
    }
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  } finally {
    client.release();
    await pool.end();
    console.log('\n🔚 Conexão encerrada');
  }
}

encontrarFuncoes();