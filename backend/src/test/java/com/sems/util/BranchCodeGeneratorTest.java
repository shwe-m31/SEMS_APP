package com.sems.util;

import com.sems.repository.BranchRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

class BranchCodeGeneratorTest {

    private BranchRepository branchRepository;
    private BranchCodeGenerator generator;

    @BeforeEach
    void setUp() {
        branchRepository = Mockito.mock(BranchRepository.class);
        generator = new BranchCodeGenerator(branchRepository);
    }

    @Test
    void testChennaiBranchCode() {
        when(branchRepository.existsByBranchCode(anyString())).thenReturn(false);

        String code = generator.generateBranchCode("Chennai", "Chennai Main");
        assertEquals("SEMS-CHN-001", code);
    }

    @Test
    void testCoimbatoreBranchCode() {
        when(branchRepository.existsByBranchCode(anyString())).thenReturn(false);

        String code = generator.generateBranchCode("Coimbatore", "Coimbatore Branch");
        assertEquals("SEMS-CBE-001", code);
    }

    @Test
    void testErodeBranchCode() {
        when(branchRepository.existsByBranchCode(anyString())).thenReturn(false);

        String code = generator.generateBranchCode("Erode", "Erode Branch");
        assertEquals("SEMS-ERD-001", code);
    }

    @Test
    void testSequenceIncrementWhenCollision() {
        when(branchRepository.existsByBranchCode("SEMS-CHN-001")).thenReturn(true);
        when(branchRepository.existsByBranchCode("SEMS-CHN-002")).thenReturn(false);

        String code = generator.generateBranchCode("Chennai", "Chennai Branch 2");
        assertEquals("SEMS-CHN-002", code);
    }
}
