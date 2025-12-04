-- criar-funcoes.sql
-- ============================================
-- FUNÇÕES PRINCIPAIS PARA O SISTEMA DE LOCAÇÃO
-- ============================================

-- 1. FUNÇÃO: Calcular total de uma locação
CREATE OR REPLACE FUNCTION fn_calcular_total(p_id_locacao INTEGER)
RETURNS DECIMAL AS $$
DECLARE
    v_total DECIMAL(10,2) := 0;
    v_dias INTEGER;
BEGIN
    -- Calcula número de dias (data atual vs data locação)
    SELECT GREATEST(
        DATE_PART('day', CURRENT_DATE - l.data_locacao)::INTEGER + 1,
        1
    ) INTO v_dias
    FROM locacao l
    WHERE l.id_locacao = p_id_locacao;
    
    -- Calcula total: soma (valor_diaria * quantidade * dias)
    SELECT COALESCE(SUM(e.valor_diaria * il.quantidade * v_dias), 0)
    INTO v_total
    FROM item_locacao il
    JOIN equipamento e ON il.id_equipamento = e.id_equipamento
    WHERE il.id_locacao = p_id_locacao;
    
    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- 2. PROCEDIMENTO: Gerar parcelas
CREATE OR REPLACE PROCEDURE prc_gerar_parcelas(
    p_id_locacao INTEGER,
    p_num_parcelas INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total DECIMAL(10,2);
    v_valor_base DECIMAL(10,2);
    v_diferenca DECIMAL(10,2);
    v_data_base DATE;
    i INTEGER;
BEGIN
    -- Calcula o total
    SELECT fn_calcular_total(p_id_locacao) INTO v_total;
    
    IF v_total <= 0 THEN
        RAISE EXCEPTION 'Total da locação deve ser maior que zero';
    END IF;
    
    IF p_num_parcelas <= 0 THEN
        RAISE EXCEPTION 'Número de parcelas deve ser maior que zero';
    END IF;
    
    -- Valor base (arredondado)
    v_valor_base := ROUND(v_total / p_num_parcelas, 2);
    v_diferenca := v_total - (v_valor_base * p_num_parcelas);
    
    -- Data base da locação
    SELECT data_locacao INTO v_data_base
    FROM locacao 
    WHERE id_locacao = p_id_locacao;
    
    -- Gera parcelas
    FOR i IN 1..p_num_parcelas LOOP
        INSERT INTO parcela (
            id_locacao, 
            valor, 
            data_vencimento
        ) VALUES (
            p_id_locacao,
            CASE 
                WHEN i = p_num_parcelas THEN v_valor_base + v_diferenca
                ELSE v_valor_base
            END,
            v_data_base + (i * 30)  -- 30 dias entre parcelas
        );
    END LOOP;
    
    RAISE NOTICE 'Parcelas geradas para locação %: % parcelas (total: R$ %)', 
        p_id_locacao, p_num_parcelas, v_total;
END;
$$;

-- 3. FUNÇÃO: Calcular dias de atraso
CREATE OR REPLACE FUNCTION fn_dias_atraso(
    p_id_locacao INTEGER, 
    p_data_devolucao DATE DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_data_prevista DATE;
    v_data_ref DATE;
BEGIN
    -- Data de referência: parâmetro ou data atual
    v_data_ref := COALESCE(p_data_devolucao, CURRENT_DATE);
    
    -- Busca data prevista da locação
    SELECT data_prevista INTO v_data_prevista
    FROM locacao 
    WHERE id_locacao = p_id_locacao;
    
    -- Calcula dias de atraso (negativo se adiantado)
    RETURN GREATEST(DATE_PART('day', v_data_ref - v_data_prevista)::INTEGER, 0);
END;
$$ LANGUAGE plpgsql;

-- 4. FUNÇÃO: Calcular multa por atraso
CREATE OR REPLACE FUNCTION fn_calcular_multa(
    p_id_locacao INTEGER, 
    p_data_devolucao DATE DEFAULT NULL
)
RETURNS DECIMAL AS $$
DECLARE
    v_dias_atraso INTEGER;
    v_total DECIMAL(10,2);
    v_multa DECIMAL(10,2);
BEGIN
    -- Calcula dias de atraso
    v_dias_atraso := fn_dias_atraso(p_id_locacao, p_data_devolucao);
    
    IF v_dias_atraso <= 0 THEN
        RETURN 0;
    END IF;
    
    -- Calcula total da locação
    v_total := fn_calcular_total(p_id_locacao);
    
    -- Multa: 2% por dia de atraso (máximo 20%)
    v_multa := v_total * LEAST(v_dias_atraso * 0.02, 0.20);
    
    RETURN ROUND(v_multa, 2);
END;
$$ LANGUAGE plpgsql;

-- 5. PROCEDIMENTO: Fechar locação
CREATE OR REPLACE PROCEDURE prc_fechar_locacao(
    p_id_locacao INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_multa DECIMAL(10,2);
BEGIN
    -- Calcula multa se houver atraso
    v_multa := fn_calcular_multa(p_id_locacao);
    
    -- Atualiza status da locação
    UPDATE locacao 
    SET 
        status = 'Finalizada',
        data_devolucao = CURRENT_DATE
    WHERE id_locacao = p_id_locacao;
    
    -- Se houver multa, cria uma parcela extra
    IF v_multa > 0 THEN
        INSERT INTO parcela (id_locacao, valor, data_vencimento)
        VALUES (p_id_locacao, v_multa, CURRENT_DATE);
        
        RAISE NOTICE 'Locação % finalizada com multa de R$ %', p_id_locacao, v_multa;
    ELSE
        RAISE NOTICE 'Locação % finalizada sem multa', p_id_locacao;
    END IF;
END;
$$;

-- 6. FUNÇÃO: Verificar se todas parcelas foram pagas
CREATE OR REPLACE FUNCTION fn_todas_parcelas_pagas(p_id_locacao INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 
        FROM parcela 
        WHERE id_locacao = p_id_locacao 
        AND data_pagamento IS NULL
    );
END;
$$ LANGUAGE plpgsql;

-- 7. PROCEDIMENTO: Pagar parcela
CREATE OR REPLACE PROCEDURE prc_pagar_parcela(
    p_id_parcela INTEGER,
    p_valor_pago DECIMAL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_valor_parcela DECIMAL(10,2);
BEGIN
    -- Busca valor da parcela
    SELECT valor INTO v_valor_parcela
    FROM parcela
    WHERE id_parcela = p_id_parcela;
    
    -- Valida pagamento
    IF p_valor_pago < v_valor_parcela THEN
        RAISE EXCEPTION 'Valor pago (R$ %) é menor que valor da parcela (R$ %)', 
            p_valor_pago, v_valor_parcela;
    END IF;
    
    -- Registra pagamento
    UPDATE parcela 
    SET 
        data_pagamento = CURRENT_DATE,
        status = 'Pago'
    WHERE id_parcela = p_id_parcela;
    
    RAISE NOTICE 'Parcela % paga: R$ %', p_id_parcela, p_valor_pago;
    
    -- Se for maior, registra troco
    IF p_valor_pago > v_valor_parcela THEN
        RAISE NOTICE 'Troco: R$ %', (p_valor_pago - v_valor_parcela);
    END IF;
END;
$$;